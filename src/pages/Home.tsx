import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase' // ← 追加
import { useNavigate, useParams } from 'react-router-dom'; // ← useParamsを追加
import { getDesireBadgeClass } from '../utils/helpers'; // 追加
import { PageHeader } from '../components/common/PageHeader'; // 追加
import { InfoCard } from '../components/common/InfoCard'; // 追加
import { WorkspaceMembers } from '../components/WorkspaceMembers'; // 追加
import { useWorkspace } from '../hooks/useWorkspace'; // ← 追加
import { ActionButtons } from '../components/common/ActionButtons'; // ← 追加
import { PageLayout } from '../components/common/PageLayout';
import './Home.scss';

// 型定義
// 学校マスタ用のインターフェースを追加
interface SchoolMaster {
  school_code: string;
  name: string;
  prefecture: string;
  address: string;
}

interface School {
  id: string;
  schoolId: string;  // 追加: schools.id
  schoolCode: string; // 追加: schools.school_code
  name: string;
  desireLevel: number;
  desireLevelParent: number;
  commuteTime: number;
  nearestStation: string;
  updatedAt: string;
}

interface Exam {
  id: string;
  schoolName: string;
  desireLevel: number;
  examDate: string;
  examTime: string;
  deviationValue: number;
  updatedAt: string;
}

interface Member {
  id: string;
  name: string;
  role: 'owner' | 'member';
}

const Home: React.FC = () => {
  // URLパラメータからworkspaceIdを取得
  const { workspaceId } = useParams<{ workspaceId: string }>();

  // デバッグログを追加（← ここに追加）
  useEffect(() => {
    console.log('Home画面: workspaceId =', workspaceId);
  }, [workspaceId]);
  
  // 検索関連
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchSuggestions, setSearchSuggestions] = useState<SchoolMaster[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const isComposingRef = useRef(false); // ← useRefに変更
    const navigate = useNavigate();

  // データ
  const [schools, setSchools] = useState<School[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // ソート
  const [schoolSortBy, setSchoolSortBy] = useState<'desire' | 'time'>('desire');
  const [schoolSortOrder, setSchoolSortOrder] = useState<'asc' | 'desc'>('desc');
  const [examSortBy, setExamSortBy] = useState<'desire' | 'date' | 'deviation'>('date');
  const [examSortOrder, setExamSortOrder] = useState<'asc' | 'desc'>('asc');

  // メニュー表示状態
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ワークスペース情報（カスタムフックに置き換え）
  const { workspaceName, workspaceOwner } = useWorkspace(workspaceId);

  // 志望校データを取得
  useEffect(() => {
    const fetchTargetSchools = async () => {
      if (!workspaceId) {
        console.log('workspaceIdが未設定のため志望校データ取得をスキップ');
        return;
      }

      try {
        console.log('=== 志望校データ取得開始 ===');
        
        // school_detailsを基準にデータを取得
        const { data: detailsData, error: detailsError } = await supabase
          .from('school_details')
          .select(`
            school_id,
            commute_time,
            nearest_station,
            updated_at,
            schools!inner (
              id,
              school_code,
              name
            )
          `)
          .eq('workspace_id', workspaceId);

        console.log('school_detailsデータ取得結果:', detailsData);
        console.log('school_detailsデータ取得エラー:', detailsError);

        if (detailsError) throw detailsError;

        if (detailsData && detailsData.length > 0) {
          // 各学校のtarget_schoolsを個別に取得
          const schoolsWithTargetInfo = await Promise.all(
            detailsData.map(async (item: any) => {
              // target_schoolsを取得
              const { data: targetData } = await supabase
                .from('target_schools')
                .select('id, child_aspiration, parent_aspiration, updated_at')
                .eq('school_id', item.school_id)
                .eq('workspace_id', workspaceId)
                .maybeSingle();

              // target_schoolsのupdated_atとschool_detailsのupdated_atを比較して新しい方を使用
              const targetUpdatedAt = targetData?.updated_at ? new Date(targetData.updated_at) : null;
              const detailsUpdatedAt = new Date(item.updated_at);
              const latestUpdatedAt = targetUpdatedAt && targetUpdatedAt > detailsUpdatedAt 
                ? targetUpdatedAt 
                : detailsUpdatedAt;

              return {
                id: targetData?.id || item.school_id, // target_schoolsのidがあればそれを使用、なければschool_idを使用
                schoolId: item.schools.id,
                schoolCode: item.schools.school_code,
                name: item.schools.name,
                desireLevel: targetData?.child_aspiration || 0, // target_schoolsがなければ0
                desireLevelParent: targetData?.parent_aspiration || 0, // target_schoolsがなければ0
                commuteTime: item.commute_time || 0,
                nearestStation: item.nearest_station || '未設定',
                updatedAt: latestUpdatedAt.toLocaleDateString('ja-JP')
              };
            })
          );

          console.log('整形後の志望校データ:', schoolsWithTargetInfo);
          setSchools(schoolsWithTargetInfo);

          // URLパラメータからscrollToを取得してスクロール
          const params = new URLSearchParams(window.location.search);
          const scrollToId = params.get('scrollTo');
          if (scrollToId) {
            // 少し遅延させてDOMレンダリング完了後にスクロール
            setTimeout(() => {
              const element = document.getElementById(`school-${scrollToId}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // URLパラメータをクリーンアップ
                window.history.replaceState({}, '', `/workspace/${workspaceId}`);
              }
            }, 300);
          }
        } else {
          console.log('志望校データが見つかりません');
          setSchools([]);
        }
      } catch (err) {
        console.error('志望校データ取得エラー:', err);
        setSchools([]);
      }
    };

    fetchTargetSchools();
  }, [workspaceId]);

  // この useEffect は削除（useWorkspace フックで置き換え済み）

  // 検索処理（セキュリティ対策：バリデーション付き）
  // リアルタイム検索（入力中に候補を表示）
// 【修正箇所】handleSearchInput関数
const handleSearchInput = async (value: string) => {
  setSearchQuery(value);
  
  if (isComposingRef.current) {
    console.log('IME変換中のため検索スキップ');
    return;
  }
  
  const sanitizedQuery = value.trim();
  
  console.log('=== 検索デバッグ ===');
  console.log('入力値:', value);
  console.log('検索クエリ:', sanitizedQuery);
  
  // 入力が空または2文字未満の場合は候補を非表示
  if (!sanitizedQuery || sanitizedQuery.length < 2) {
    console.log('2文字未満のため検索スキップ');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    return;
  }
  
  // 文字数制限
  if (sanitizedQuery.length > 50) {
    console.log('50文字を超えているため検索スキップ');
    return;
  }
  
  // 特殊文字チェック
  const allowedPattern = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBFa-zA-Z0-9\s\-ー]+$/;
  if (!allowedPattern.test(sanitizedQuery)) {
    console.log('使用できない文字が含まれています');
    return;
  }
  
  try {
    setIsSearching(true);
    console.log('Supabase検索開始...');
    
    // Supabaseから学校名を部分一致検索（ILIKE使用）
    const { data, error } = await supabase
      .from('schools')
      .select('school_code, name, prefecture, address')
      .ilike('name', `%${sanitizedQuery}%`)
      .limit(10);
    
    console.log('検索結果:', data);
    console.log('エラー:', error);
    
    if (error) {
      console.error('Supabaseエラー詳細:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log(`${data.length}件の候補を表示`);
      setSearchSuggestions(data);
      setShowSuggestions(true);
    } else {
      console.log('該当する学校が見つかりませんでした');
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  } catch (error) {
    console.error('検索エラー:', error);
    setSearchSuggestions([]);
    setShowSuggestions(false);
  } finally {
    setIsSearching(false);
  }
};

    // 候補選択時の処理
    const handleSelectSchool = (school: SchoolMaster) => {
      setSearchQuery(school.name);
      setShowSuggestions(false);
      setSearchSuggestions([]);
      
      // School画面へ遷移
      navigate(`/workspace/${workspaceId}/school/${school.school_code}`); // ← workspaceIdを追加
    };

    const handleSearch = () => {
      // 検索ボタンクリック時の処理（現状は入力時に自動検索されるため空実装）
      console.log('検索ボタンがクリックされました');
    };

  // Enterキーでの検索対応
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // ソート処理
  const sortSchools = (schools: School[]) => {
    const sorted = [...schools].sort((a, b) => {
      let compareValue = 0;
      if (schoolSortBy === 'desire') {
        compareValue = a.desireLevel - b.desireLevel;
      } else {
        compareValue = a.commuteTime - b.commuteTime;
      }
      return schoolSortOrder === 'asc' ? compareValue : -compareValue;
    });
    return sorted;
  };

  const sortExams = (exams: Exam[]) => {
    const sorted = [...exams].sort((a, b) => {
      let compareValue = 0;
      if (examSortBy === 'desire') {
        compareValue = a.desireLevel - b.desireLevel;
      } else if (examSortBy === 'date') {
        compareValue = new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
      } else {
        compareValue = a.deviationValue - b.deviationValue;
      }
      return examSortOrder === 'asc' ? compareValue : -compareValue;
    });
    return sorted;
  };

  return (
    <PageLayout
      workspaceName={workspaceName}
      workspaceOwner={workspaceOwner}
      isMenuOpen={isMenuOpen}
      onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      onMenuClose={() => setIsMenuOpen(false)}
    >
      {/* 学校検索セクション */}
      <section className="home-section search-section">
          <h2 className="section-title">学校検索</h2>
          <div className="search-form">
        <div className="search-input-wrapper">
            <input
            type="text"
            className="search-input"
            placeholder="学校名を入力してください（2文字以上）"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onCompositionStart={() => { isComposingRef.current = true; }}
            onCompositionEnd={(e) => {
                isComposingRef.current = false;
                handleSearchInput(e.currentTarget.value);
            }}
            onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
            disabled={isSearching}
            />
            {isSearching && <span className="search-loading">検索中...</span>}
            
            {/* 候補リスト */}
            {showSuggestions && searchSuggestions.length > 0 && (
            <div className="search-suggestions">
                {searchSuggestions.map((school) => (
                <div
                    key={school.school_code}
                    className="suggestion-item"
                    onClick={() => handleSelectSchool(school)}
                >
                    <div className="suggestion-name">{school.name}</div>
                    <div className="suggestion-info">
                    {school.prefecture} - {school.address}
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
        </section>

        {/* 志望校一覧セクション */}
        <section className="home-section schools-section">
          <div className="section-title">
            <span>志望校一覧</span>
            <div className="sort-controls">
              <select 
                value={`${schoolSortBy}-${schoolSortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as ['desire' | 'commute', 'asc' | 'desc'];
                  setSchoolSortBy(sortBy);
                  setSchoolSortOrder(sortOrder);
                }}
                className="sort-select"
              >
                <option value="desire-desc">志望度（高→低）</option>
                <option value="desire-asc">志望度（低→高）</option>
                <option value="commute-asc">通学時間（短→長）</option>
                <option value="commute-desc">通学時間（長→短）</option>
              </select>
            </div>
          </div>

          <div className="section-content">
          {schools.length === 0 ? (
            <div className="empty-message">
              <p>志望校はまだ登録されていません</p>
            </div>
          ) : (
            sortSchools(schools).map((school) => (
              <div key={school.id}>
                <InfoCard
                  className="school-card"
                  title={school.name}
                badge={
                  <span className={`desire-badge ${getDesireBadgeClass(school.desireLevel)}`}>
                    志望度: {school.desireLevel}
                  </span>
                }
                rows={[
                  { label: '志望度（親）', value: school.desireLevelParent },
                  { label: '通学時間', value: `${school.commuteTime}分` },
                  { label: '最寄駅', value: school.nearestStation },
                  { label: '更新日', value: school.updatedAt }
                ]}
                actions={
                  <ActionButtons
                    workspaceId={workspaceId!}
                    buttons={[
                      {
                        label: '学校情報',
                        path: `/workspace/${workspaceId}/school/${school.schoolCode}`,
                        variant: 'info'
                      },
                      {
                        label: '志望校情報',
                        path: `/workspace/${workspaceId}/target/${school.schoolCode}`,
                        variant: 'target'
                      },
                      {
                        label: '受験情報',
                        variant: 'exam'
                      }
                    ]}
                  />
                }
              />
            </div>
            ))
            )}
        </div>
      </section>

        {/* 受験一覧セクション */}
        <section className="home-section exams-section">
          <div className="section-title">
            <span>受験一覧</span>
            <div className="sort-controls">
              <select 
                value={`${examSortBy}-${examSortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as ['desire' | 'date' | 'deviation', 'asc' | 'desc'];
                  setExamSortBy(sortBy);
                  setExamSortOrder(sortOrder);
                }}
                className="sort-select"
              >
                <option value="date-asc">受験日（早→遅）</option>
                <option value="date-desc">受験日（遅→早）</option>
                <option value="desire-desc">志望度（高→低）</option>
                <option value="desire-asc">志望度（低→高）</option>
                <option value="deviation-desc">偏差値（高→低）</option>
                <option value="deviation-asc">偏差値（低→高）</option>
              </select>
            </div>
          </div>

          <div className="section-content">
            {exams.length === 0 ? (
              <div className="empty-message">
                <p>受験はまだ登録されていません</p>
              </div>
            ) : (
              sortExams(exams).map((exam) => (
                <div key={exam.id}>
                  <InfoCard
                    className="exam-card"
                    title={exam.schoolName}
                    badge={
                      <span className={`desire-badge ${getDesireBadgeClass(exam.desireLevel)}`}>
                        志望度: {exam.desireLevel}
                      </span>
                    }
                    rows={[
                      { label: '受験日', value: exam.examDate },
                      { label: '受験時間', value: exam.examTime },
                      { label: '偏差値', value: exam.deviationValue },
                      { label: '更新日', value: exam.updatedAt }
                    ]}
                    actions={
                      <ActionButtons
                        workspaceId={workspaceId!}
                        buttons={[
                          {
                            label: '受験情報',
                            variant: 'info'
                          },
                          {
                            label: '受験管理',
                            variant: 'exam'
                          }
                        ]}
                      />
                    }
                  />
                </div>
              ))
            )}
        </div>
      </section>

        {/* ワークスペースメンバーセクション */}
        {workspaceId && (
          <section className="home-section members-section">
            <WorkspaceMembers workspaceId={workspaceId} />
          </section>
        )}
      </PageLayout>
    );
  };

export default Home;