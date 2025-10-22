// src/pages/Comparison1.tsx
// 志望校情報一覧画面
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../hooks/useWorkspace';
import { PageLayout } from '../components/common/PageLayout';
import { LoadingError } from '../components/common/LoadingError';
import { ActionButtons } from '../components/common/ActionButtons';
import { ComparisonCard } from '../components/comparison/ComparisonCard';
import type { ComparisonCardField, ComparisonCardButton } from '../components/comparison/ComparisonCard';
import './Comparison1.scss';

interface TargetSchool {
  id: string;
  school_id: string;
  school_code: string;  // ← 追加
  schoolName: string;
  childAspiration: number;
  parentAspiration: number;
  commuteTime: number | null;
  nearestStation: string | null;
  officialWebsite: string | null;
  updatedAt: string;
}

type SortBy = 'childAspiration' | 'commuteTime';
type SortOrder = 'asc' | 'desc';

const Comparison1: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { workspaceName, workspaceOwner } = useWorkspace(workspaceId);
  
  const [schools, setSchools] = useState<TargetSchool[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('childAspiration');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchTargetSchools();
  }, [workspaceId]);

  const fetchTargetSchools = async () => {
    if (!workspaceId) return;

    try {
      setLoading(true);
      setError(null);

      // target_schoolsとschoolsを結合して最新の志望度を取得
      const { data, error: fetchError } = await supabase
        .from('target_schools')
        .select(`
          id,
          school_id,
          child_aspiration,
          parent_aspiration,
          updated_at,
          schools!inner (
            name,
            school_code,
            school_details (
                commute_time,
                nearest_station,
                official_website
            )
            )
        `)
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      // 学校ごとに最新のデータを取得
      const schoolMap = new Map<string, TargetSchool>();
      
      data?.forEach(item => {
        const schoolId = item.school_id;
        
        if (!schoolMap.has(schoolId)) {
          schoolMap.set(schoolId, {
            id: item.id,
            school_id: schoolId,
            school_code: item.schools.school_code,
            schoolName: item.schools.name,
            childAspiration: item.child_aspiration,
            parentAspiration: item.parent_aspiration,
            commuteTime: item.schools.school_details?.[0]?.commute_time || null,
            nearestStation: item.schools.school_details?.[0]?.nearest_station || null,
            officialWebsite: item.schools.school_details?.[0]?.official_website || null,
            updatedAt: item.updated_at
          });
        }
      });

      setSchools(Array.from(schoolMap.values()));
    } catch (err) {
      console.error('Error fetching target schools:', err);
      setError('志望校情報の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const getSortedSchools = () => {
    return [...schools].sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'childAspiration') {
        compareValue = a.childAspiration - b.childAspiration;
      } else if (sortBy === 'commuteTime') {
        const aTime = a.commuteTime || 9999;
        const bTime = b.commuteTime || 9999;
        compareValue = aTime - bTime;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
  };

  const handleNavigateToTarget = (schoolCode: string) => {
    navigate(`/workspace/${workspaceId}/target/${schoolCode}`);
    };

  const handleNavigateToExam = (schoolId: string) => {
    navigate(`/workspace/${workspaceId}/school/${schoolId}/exam`);
  };

  if (loading || !workspaceName) {
    return (
      <PageLayout
        workspaceName="読み込み中..."
        workspaceOwner=""
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onMenuClose={() => setIsMenuOpen(false)}
        workspaceId={workspaceId}
      >
        <LoadingError
          loading={loading}
          error={null}
          loadingMessage="志望校情報を読み込んでいます..."
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      workspaceName={workspaceName}
      workspaceOwner={workspaceOwner}
      isMenuOpen={isMenuOpen}
      onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      onMenuClose={() => setIsMenuOpen(false)}
      workspaceId={workspaceId}
    >
      <div className="comparison1-page">
        {/* 志望校一覧セクション */}
        <section className="comparison1-section">
          <div className="section-header">
            <h2 className="section-title">志望校情報一覧</h2>
            <div className="sort-controls">
              <button
                className={`sort-btn ${sortBy === 'childAspiration' ? 'active' : ''}`}
                onClick={() => handleSort('childAspiration')}
              >
                志望度（子）
                {sortBy === 'childAspiration' && (
                  <span className="sort-icon">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
              <button
                className={`sort-btn ${sortBy === 'commuteTime' ? 'active' : ''}`}
                onClick={() => handleSort('commuteTime')}
              >
                通学時間
                {sortBy === 'commuteTime' && (
                  <span className="sort-icon">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </div>
          </div>

          {error && (
            <LoadingError
              loading={false}
              error={error}
            />
          )}

          {schools.length === 0 ? (
            <div className="empty-message">
              <p>志望校情報はまだ登録されていません</p>
            </div>
          ) : (
            <div className="comparison-cards">
              {getSortedSchools().map(school => {
                const fields: ComparisonCardField[] = [
                  { label: '学校名', value: school.schoolName },
                  { 
                    label: '志望度（子）', 
                    value: <span className={`desire-badge badge-level-${school.childAspiration}`}>{school.childAspiration}</span> 
                  },
                  { 
                    label: '志望度（親）', 
                    value: <span className={`desire-badge badge-level-${school.parentAspiration}`}>{school.parentAspiration}</span> 
                  },
                  { 
                    label: '通学時間', 
                    value: school.commuteTime ? `${school.commuteTime}分` : '未登録' 
                  },
                  { 
                    label: '最寄駅', 
                    value: school.nearestStation || '未登録' 
                  },
                  { 
                    label: '公式サイト', 
                    value: school.officialWebsite ? (
                      <a href={school.officialWebsite} target="_blank" rel="noopener noreferrer">
                        リンク
                      </a>
                    ) : '未登録'
                  }
                ];

                const buttons: ComparisonCardButton[] = [
                  {
                    label: '志望校情報',
                    onClick: () => handleNavigateToTarget(school.school_code),
                    variant: 'target'
                  },
                  {
                    label: '受験情報',
                    onClick: () => handleNavigateToExam(school.school_id),
                    variant: 'exam'
                  }
                ];

                return (
                  <ComparisonCard
                    key={school.id}
                    fields={fields}
                    buttons={buttons}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* ボタンセクション */}
        <section className="comparison1-section action-buttons-section">
          <ActionButtons
            workspaceId={workspaceId!}
            direction="vertical"
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

export default Comparison1;