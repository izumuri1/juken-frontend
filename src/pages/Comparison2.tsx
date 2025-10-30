// src/pages/Comparison2.tsx
// 受験情報一覧画面
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../hooks/useWorkspace';
import { PageLayout } from '../components/common/PageLayout';
import { LoadingError } from '../components/common/LoadingError';
import { ActionButtons } from '../components/common/ActionButtons';
import { ComparisonCard } from '../components/comparison/ComparisonCard';
import type { ComparisonCardField, ComparisonCardButton } from '../components/comparison/ComparisonCard';
import './Comparison2.scss';

interface ExamSchedule {
  id: string;
  school_id: string;
  school_code: string;
  schoolName: string;
  examCandidateSign: string | null;
  deviationValue: number;
  judgmentResult: string | null;
  childAspiration: number;
  examStart: string;
  examEnd: string;
  nearestStation: string | null;
  officialWebsite: string | null;
  updatedAt: string;
}

type SortBy = 'childAspiration' | 'examStart' | 'deviationValue';
type SortOrder = 'asc' | 'desc';
type FilterBy = 'all' | 'exam' | 'skip';  // 追加

const Comparison2: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { workspaceName, workspaceOwner } = useWorkspace(workspaceId);
  
  const [exams, setExams] = useState<ExamSchedule[]>([]);
    const [sortBy, setSortBy] = useState<SortBy>('childAspiration');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [filterBy, setFilterBy] = useState<FilterBy>('all');  // 追加
    const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchExamSchedules();
  }, [workspaceId]);

  const fetchExamSchedules = async () => {
    if (!workspaceId) return;

    try {
        setLoading(true);
        setError(null);

        // exam_infoとschoolsを結合
        const { data, error: fetchError } = await supabase
        .from('exam_info')
        .select(`
            id,
            school_id,
            deviation_value,
            judgment_result,
            exam_candidate_sign,
            exam_start,
            exam_end,
            updated_at,
            schools!inner (
            school_code,
            name
            )
        `)
        .eq('workspace_id', workspaceId)
        .order('exam_start', { ascending: true });

        if (fetchError) throw fetchError;

        // 各受験情報の詳細データを取得
        const examsWithDetails = await Promise.all(
        (data || []).map(async (exam) => {
            // 最新志望度を取得
            const { data: aspirationData } = await supabase
              .from('target_schools')  // ← 正しいテーブル名に修正
              .select('child_aspiration')
              .eq('workspace_id', workspaceId)
              .eq('school_id', exam.school_id)
              .order('event_date', { ascending: false })
              .limit(1)
              .maybeSingle();  // ← データが存在しない場合もエラーにならないように変更

            // school_detailsを取得
            const { data: schoolDetailData } = await supabase
            .from('school_details')
            .select('nearest_station, official_website')
            .eq('workspace_id', workspaceId)
            .eq('school_id', exam.school_id)
            .single();

            const school = Array.isArray(exam.schools) ? exam.schools[0] : exam.schools;

            return {
            id: exam.id,
            school_id: exam.school_id,
            school_code: school.school_code,
            schoolName: school.name,
            examCandidateSign: exam.exam_candidate_sign,
            deviationValue: exam.deviation_value,
            judgmentResult: exam.judgment_result,
            childAspiration: aspirationData?.child_aspiration || 0,
            examStart: exam.exam_start,
            examEnd: exam.exam_end,
            nearestStation: schoolDetailData?.nearest_station || null,
            officialWebsite: schoolDetailData?.official_website || null,
            updatedAt: exam.updated_at
            };
        })
        );

        setExams(examsWithDetails);
    } catch (err) {
        console.error('受験情報の取得エラー:', err);
        setError('受験情報の取得に失敗しました');
    } finally {
        setLoading(false);
    }
    };

  const getSortedExams = () => {
    // フィルタリング処理を追加
    let filtered = exams;
    if (filterBy === 'exam') {
        filtered = exams.filter(exam => exam.examCandidateSign === '受験');
    } else if (filterBy === 'skip') {
        filtered = exams.filter(exam => exam.examCandidateSign === '見送り');
    }
    
    // ソート処理
    const sorted = [...filtered].sort((a, b) => {
        let compareValue = 0;
        
        if (sortBy === 'childAspiration') {
        compareValue = a.childAspiration - b.childAspiration;
        } else if (sortBy === 'examStart') {
        compareValue = new Date(a.examStart).getTime() - new Date(b.examStart).getTime();
        } else if (sortBy === 'deviationValue') {
        compareValue = a.deviationValue - b.deviationValue;
        }
        
        return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
    };

  const handleNavigateToExam = (schoolId: string) => {
    navigate(`/workspace/${workspaceId}/school/${schoolId}/exam`);
    };

  const handleNavigateToTask = () => {
    navigate(`/workspace/${workspaceId}/task`);
    };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    // 時刻のみをフォーマットする関数を追加
    const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

  return (
    <PageLayout
      workspaceName={workspaceName}
      workspaceOwner={workspaceOwner}
      isMenuOpen={isMenuOpen}
      onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      onMenuClose={() => setIsMenuOpen(false)}
      workspaceId={workspaceId!}
    >
      <div className="comparison2-page">
        {/* 受験情報一覧セクション */}
        <section className="comparison2-section">
          <div className="section-title">
            <span>受験情報一覧</span>
            <div className="sort-controls">
                <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterBy)}
                className="sort-select"
                >
                <option value="all">すべて</option>
                <option value="exam">受験</option>
                <option value="skip">見送り</option>
                </select>
                <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-') as [SortBy, SortOrder];
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                }}
                className="sort-select"
                >
                <option value="childAspiration-desc">志望度（高→低）</option>
                <option value="childAspiration-asc">志望度（低→高）</option>
                <option value="examStart-asc">受験時間（早→遅）</option>
                <option value="examStart-desc">受験時間（遅→早）</option>
                <option value="deviationValue-desc">偏差値（高→低）</option>
                <option value="deviationValue-asc">偏差値（低→高）</option>
                </select>
            </div>
            </div>

          {loading && <LoadingError loading={true} />}

          {error && (
            <LoadingError
              loading={false}
              error={error}
            />
          )}

          {!loading && exams.length === 0 ? (
            <div className="empty-message">
              <p>受験情報はまだ登録されていません</p>
            </div>
          ) : (
            <div className="comparison-cards">
              {getSortedExams().map(exam => {
                const fields: ComparisonCardField[] = [
                { label: '学校名', value: exam.schoolName },
                { 
                    label: '受験候補', 
                    value: exam.examCandidateSign || '未設定' 
                },
                { label: '偏差値', value: exam.deviationValue },
                { 
                    label: '合否判定結果', 
                    value: exam.judgmentResult || '未実施' 
                },
                  { 
                    label: '志望度(子)', 
                    value: exam.childAspiration > 0 ? (
                      <span className={`desire-badge badge-level-${exam.childAspiration}`}>
                        {exam.childAspiration}
                      </span>
                    ) : '未登録'
                  },
                  { 
                    label: '受験時間', 
                    value: `${formatDateTime(exam.examStart)} ～ ${formatTime(exam.examEnd)}` 
                    },
                  { 
                    label: '最寄駅', 
                    value: exam.nearestStation || '未登録' 
                  },
                  { 
                    label: '公式サイト', 
                    value: exam.officialWebsite ? (
                      <a href={exam.officialWebsite} target="_blank" rel="noopener noreferrer">
                        リンク
                      </a>
                    ) : '未登録'
                  }
                ];

                const buttons: ComparisonCardButton[] = [
                {
                    label: '受験情報',
                    onClick: () => handleNavigateToExam(exam.school_id),
                    variant: 'exam'
                },
                {
                    label: '受験管理',
                    onClick: () => handleNavigateToTask(),
                    variant: 'info'
                }
                ];

                return (
                  <ComparisonCard
                    key={exam.id}
                    fields={fields}
                    buttons={buttons}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* ボタンセクション */}
        <section className="comparison2-section action-buttons-section">
          <ActionButtons
            workspaceId={workspaceId!}
            buttons={[
              {
                label: 'Home',
                path: `/workspace/${workspaceId}`,
                variant: 'home'
              }
            ]}
          />
        </section>
      </div>
    </PageLayout>
  );
};

export default Comparison2;