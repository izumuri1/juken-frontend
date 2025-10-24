// src/pages/Exam.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger' // ← 追加
import { PageLayout } from '../components/common/PageLayout'
import { LoadingError } from '../components/common/LoadingError'
import { ActionButtons } from '../components/common/ActionButtons'
import ExamInfoForm from '../components/exam/ExamInfoForm'
import ExamInfoCard from '../components/exam/ExamInfoCard'
import { SchoolBasicInfo } from '../components/school/SchoolBasicInfo';
import { SchoolMap } from '../components/school/SchoolMap';
import { SchoolDetailsInfo } from '../components/school/SchoolDetailsInfo';
import type { SchoolInfo, SchoolDetails } from '../types/school';
import type { ExamInfo } from '../types/exam';
import './Exam.scss'

export default function Exam() {
  const { workspaceId, schoolId } = useParams<{ workspaceId: string; schoolId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [school, setSchool] = useState<SchoolInfo | null>(null)
  const [schoolDetail, setSchoolDetail] = useState<SchoolDetails | null>(null)
  const [examInfos, setExamInfos] = useState<ExamInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // PageLayout用の状態
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceOwner, setWorkspaceOwner] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (!user || !workspaceId || !schoolId) return
    loadData()
    fetchWorkspaceInfo()
  }, [user, workspaceId, schoolId])

  const fetchWorkspaceInfo = async () => {
    if (!workspaceId) return

    try {
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('name, owner_id')
        .eq('id', workspaceId)
        .single()

      if (workspaceError) throw workspaceError

      setWorkspaceName(workspaceData.name)

      const { data: ownerData, error: ownerError } = await supabase
        .from('users')
        .select('username')
        .eq('id', workspaceData.owner_id)
        .single()

      if (ownerError) throw ownerError

      setWorkspaceOwner(ownerData.username)
    } catch (err) {
      logger.error('Error fetching workspace info:', err)
    }
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      await Promise.all([
        fetchSchool(),
        fetchSchoolDetail(),
        fetchExamInfos()
      ])
    } catch (err) {
      logger.error('Error loading data:', err)
      setError('データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchSchool = async () => {
  logger.log('=== fetchSchool開始 ===')
  logger.log('schoolId:', schoolId)
  logger.log('workspaceId:', workspaceId)
  
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .single()

  logger.log('学校データ取得結果:', data)
  logger.log('学校データ取得エラー:', error)

  if (error) {
    logger.error('fetchSchoolでエラー:', error)
    throw error
  }
    setSchool(data)
    }

  const fetchSchoolDetail = async () => {
    const { data, error } = await supabase
      .from('school_details')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('school_id', schoolId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    setSchoolDetail(data)
  }

  const fetchExamInfos = async () => {
    const { data, error } = await supabase
      .from('exam_info')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('school_id', schoolId)
      .order('exam_start', { ascending: true })

    if (error) throw error
    setExamInfos(data || [])
  }

  const handleExamInfoCreated = () => {
    fetchExamInfos()
  }

  const handleExamInfoUpdated = () => {
    fetchExamInfos()
  }

  const handleExamInfoDeleted = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exam_info')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchExamInfos()
    } catch (err) {
      console.error('Error deleting exam info:', err)
      setError('受験情報の削除に失敗しました')
    }
  }

  if (loading || error || !school) {
  return (
    <PageLayout
        workspaceName={workspaceName}
        workspaceOwner={workspaceOwner}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onMenuClose={() => setIsMenuOpen(false)}
        workspaceId={workspaceId}  // ← この行を追加
        >
      <LoadingError
        loading={loading}
        error={error || (!school ? '学校が見つかりません' : null)}
      />
    </PageLayout>
  )
}

return (
  <PageLayout
    workspaceName={workspaceName}
    workspaceOwner={workspaceOwner}
    isMenuOpen={isMenuOpen}
    onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
    onMenuClose={() => setIsMenuOpen(false)}
    workspaceId={workspaceId}  // ← この行を追加
    >
    <div className="exam-page">
      {/* 学校情報セクション */}
        <section className="exam-section school-info-section">
        <h2 className="section-title">学校情報</h2>
        
        <SchoolBasicInfo
            name={school.name}
            prefecture={school.prefecture}
            address={school.address}
        />

        {school.latitude && school.longitude && (
            <SchoolMap
            latitude={school.latitude}
            longitude={school.longitude}
            schoolName={school.name}
            />
        )}

        {schoolDetail && (
            <SchoolDetailsInfo
            hasCafeteria={schoolDetail.has_cafeteria}
            hasUniform={schoolDetail.has_uniform}
            commuteRoute={schoolDetail.commute_route}
            commuteTime={schoolDetail.commute_time}
            nearestStation={schoolDetail.nearest_station}
            officialWebsite={schoolDetail.official_website}
            />
        )}
        </section>

      <section className="exam-section">
        <ExamInfoForm
          workspaceId={workspaceId!}
          schoolId={schoolId!}
          onExamInfoCreated={handleExamInfoCreated}
        />
      </section>

      <section className="exam-section exam-info-list">
        <h2 className="section-title">登録済み受験情報</h2>
        {examInfos.length === 0 ? (
            <div className="empty-message">
            <p>受験情報はまだ登録されていません</p>
            </div>
        ) : (
            <div className="exam-cards">
              {examInfos.map(examInfo => (
                <ExamInfoCard
                  key={examInfo.id}
                  examInfo={examInfo}
                  onUpdated={handleExamInfoUpdated}
                  onDeleted={handleExamInfoDeleted}
                />
              ))}
            </div>
          )}
        </section>

        {/* ボタンセクション */}
        <section className="exam-section action-buttons-section">
          <ActionButtons
            workspaceId={workspaceId!}
            direction="vertical"
            buttons={[
              {
                label: 'Home',
                path: `/workspace/${workspaceId}`,
                variant: 'home' as const
              }
            ]}
          />
        </section>
      </div>
    </PageLayout>
  )
}