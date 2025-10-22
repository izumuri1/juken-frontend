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

const Comparison2: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { workspaceName, workspaceOwner } = useWorkspace(workspaceId);
  
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('childAspiration');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
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
            .from('target_infos')
            .select('child_aspiration')
            .eq('workspace_id', workspaceId)
            .eq('school_id', exam.school_id)
            .order('event_date', { ascending: false })
            .limit(1)
            .single();

            // school_detailsを取得
            const { data: schoolDetailData } = await supabase
            .from('school_details')
            .select('nearest_station, official_website')
            .eq('workspace_id', workspaceId)
            .eq('school_id', exam.school_id)
            .single();

            return {
            id: exam.id,
            school_id: exam.school_id,
            school_code: exam.schools.school_code,
            schoolName: exam.schools.name,
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
    const sorted = [...exams].sort((a, b) => {
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

  const handleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleNavigateToExam = (schoolCode: string) => {
    navigate(`/workspace/${workspaceId}/exam/${schoolCode}`);
  };

  const handleNavigateToTask = (examId: string) => {
    navigate(`/workspace/${workspaceId}/task/${examId}`);
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
          <div className="section-header">
            <h2 className="section-title">受験情報一覧</h2>
            <div className="sort-controls">
              <button
                className={`sort-btn ${sortBy === 'childAspiration' ? 'active' : ''}`}
                onClick={() => handleSort('childAspiration')}
              >
                志望度
                {sortBy === 'childAspiration' && (
                  <span className="sort-icon">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
              <button
                className={`sort-btn ${sortBy === 'examStart' ? 'active' : ''}`}
                onClick={() => handleSort('examStart')}
              >
                受験時間
                {sortBy === 'examStart' && (
                  <span className="sort-icon">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
              <button
                className={`sort-btn ${sortBy === 'deviationValue' ? 'active' : ''}`}
                onClick={() => handleSort('deviationValue')}
              >
                偏差値
                {sortBy === 'deviationValue' && (
                  <span className="sort-icon">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
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
                    value: `${formatDateTime(exam.examStart)} ～ ${formatDateTime(exam.examEnd)}` 
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
                    onClick: () => handleNavigateToExam(exam.school_code),
                    variant: 'exam'
                  },
                  {
                    label: '受験管理',
                    onClick: () => handleNavigateToTask(exam.id),
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
                label: 'Homeに戻る',
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