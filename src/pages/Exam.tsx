// src/pages/Exam.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'
import { useWorkspace } from '../hooks/useWorkspace'
import { useSchoolInfo } from '../hooks/useSchoolInfo'
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
import { EXAM_ERROR_MESSAGES } from '../constants/errorMessages';
import './Exam.scss'

export default function Exam() {
  const { workspaceId, schoolId } = useParams<{ workspaceId: string; schoolId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [examInfos, setExamInfos] = useState<ExamInfo[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // ワークスペース情報取得
  const { workspaceName, workspaceOwner } = useWorkspace(workspaceId)
  
  // 学校情報取得
  const { school, schoolDetails: schoolDetail, loading, error } = useSchoolInfo({
    schoolId,
    workspaceId
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (!user || !workspaceId || !schoolId) return
    fetchExamInfos()
  }, [user, workspaceId, schoolId])

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
      logger.error('Error deleting exam info:', err);
      setError(EXAM_ERROR_MESSAGES.DELETE_FAILED);
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