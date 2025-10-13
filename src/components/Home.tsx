import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase' // ← 追加
import { useNavigate } from 'react-router-dom'; // ← 追加
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
  // 検索関連
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<SchoolMaster[]>([]); // ← 追加
  const [showSuggestions, setShowSuggestions] = useState(false); // ← 追加
  const navigate = useNavigate(); // ← 追加

  // データ
  const [schools, setSchools] = useState<School[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // ソート設定
  const [schoolSortBy, setSchoolSortBy] = useState<'desire' | 'commute'>('desire');
  const [schoolSortOrder, setSchoolSortOrder] = useState<'asc' | 'desc'>('desc');
  const [examSortBy, setExamSortBy] = useState<'desire' | 'date' | 'deviation'>('date');
  const [examSortOrder, setExamSortOrder] = useState<'asc' | 'desc'>('asc');

  // ワークスペース情報
  const [workspaceName] = useState('田中家の中学受験');
  const [workspaceOwner] = useState('田中太郎');

  // メニュー表示状態
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // データ取得（仮実装）
  useEffect(() => {
    // TODO: Supabaseからデータ取得
    // 仮データ
    setSchools([
      {
        id: '1',
        name: '桜蔭中学校',
        desireLevel: 5,
        desireLevelParent: 5,
        commuteTime: 45,
        nearestStation: '本郷三丁目駅',
        updatedAt: '2025-10-01'
      },
      {
        id: '2',
        name: '女子学院中学校',
        desireLevel: 4,
        desireLevelParent: 5,
        commuteTime: 35,
        nearestStation: '飯田橋駅',
        updatedAt: '2025-09-28'
      }
    ]);

    setExams([
      {
        id: '1',
        schoolName: '桜蔭中学校',
        desireLevel: 5,
        examDate: '2026-02-01',
        examTime: '09:00-12:00',
        deviationValue: 75,
        updatedAt: '2025-10-01'
      },
      {
        id: '2',
        schoolName: '女子学院中学校',
        desireLevel: 4,
        examDate: '2026-02-01',
        examTime: '13:00-16:00',
        deviationValue: 73,
        updatedAt: '2025-09-28'
      }
    ]);

    setMembers([
      { id: '1', name: '田中太郎', role: 'owner' },
      { id: '2', name: '田中花子', role: 'member' }
    ]);
  }, []);

  // 検索処理（セキュリティ対策：バリデーション付き）
  // リアルタイム検索（入力中に候補を表示）
    const handleSearchInput = async (value: string) => {
    setSearchQuery(value);
    
    const sanitizedQuery = value.trim();
    
    // 入力が空または2文字未満の場合は候補を非表示
    if (!sanitizedQuery || sanitizedQuery.length < 2) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
    }
    
    // 文字数制限
    if (sanitizedQuery.length > 50) {
        return;
    }
    
    // 特殊文字チェック
    const allowedPattern = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBFa-zA-Z0-9\s\-ー]+$/;
    if (!allowedPattern.test(sanitizedQuery)) {
        return;
    }
    
    try {
        setIsSearching(true);
        
        // Supabaseから学校名を部分一致検索（ILIKE使用）
        const { data, error } = await supabase
        .from('schools')
        .select('school_code, name, prefecture, address')
        .ilike('name', `%${sanitizedQuery}%`)
        .limit(10); // 候補は最大10件
        
        if (error) throw error;
        
        if (data && data.length > 0) {
        setSearchSuggestions(data);
        setShowSuggestions(true);
        } else {
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
    navigate(`/school/${school.school_code}`);
    };

  // Enterキーでの検索対応
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 志望度バッジの色を取得
  const getDesireBadgeClass = (level: number): string => {
    if (level >= 4) return 'badge-high';
    if (level >= 2) return 'badge-medium';
    return 'badge-low';
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
    <div className="home-container">
      {/* ヘッダー */}
      <header className="home-header">
        <button 
          className="hamburger-menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="メニュー"
        >
          <span className="hamburger-icon">☰</span>
        </button>
        
        <div className="workspace-info">
          <h1 className="workspace-name">{workspaceName}</h1>
          <p className="workspace-owner">オーナー: {workspaceOwner}</p>
        </div>

        <div style={{ width: '40px' }}></div>
      </header>

      {/* サイドメニュー */}
      {isMenuOpen && (
        <div className="side-menu-overlay" onClick={() => setIsMenuOpen(false)}>
          <nav className="side-menu" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setIsMenuOpen(false)}>✕</button>
            <ul>
              <li><a href="/home">Home</a></li>
              <li><a href="/school">School</a></li>
              <li><a href="/target">Target</a></li>
              <li><a href="/exam">Exam</a></li>
              <li><a href="/comparison">Comparison</a></li>
              <li><a href="/task">Task</a></li>
              <li className="divider"></li>
              <li><a href="/workspace">ワークスペース選択</a></li>
              <li><a href="/tutorial">チュートリアル</a></li>
              <li><a href="/logout">ログアウト</a></li>
            </ul>
          </nav>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="home-content">
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
            {sortSchools(schools).map((school) => (
              <div key={school.id} className="school-card">
                <div className="card-header">
                  <h3 className="school-name">{school.name}</h3>
                  <span className={`desire-badge ${getDesireBadgeClass(school.desireLevel)}`}>
                    志望度: {school.desireLevel}
                  </span>
                </div>
                <div className="card-body">
                  <div className="card-info-row">
                    <span className="label">志望度（親）:</span>
                    <span className="value">{school.desireLevelParent}</span>
                  </div>
                  <div className="card-info-row">
                    <span className="label">通学時間:</span>
                    <span className="value">{school.commuteTime}分</span>
                  </div>
                  <div className="card-info-row">
                    <span className="label">最寄駅:</span>
                    <span className="value">{school.nearestStation}</span>
                  </div>
                  <div className="card-info-row">
                    <span className="label">更新日:</span>
                    <span className="value">{school.updatedAt}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-info">学校情報</button>
                  <button className="btn-exam">受験情報</button>
                </div>
              </div>
            ))}
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
            {sortExams(exams).map((exam) => (
              <div key={exam.id} className="exam-card">
                <div className="card-header">
                  <h3 className="school-name">{exam.schoolName}</h3>
                  <span className={`desire-badge ${getDesireBadgeClass(exam.desireLevel)}`}>
                    志望度: {exam.desireLevel}
                  </span>
                </div>
                <div className="card-body">
                  <div className="card-info-row">
                    <span className="label">受験日:</span>
                    <span className="value">{exam.examDate}</span>
                  </div>
                  <div className="card-info-row">
                    <span className="label">受験時間:</span>
                    <span className="value">{exam.examTime}</span>
                  </div>
                  <div className="card-info-row">
                    <span className="label">偏差値:</span>
                    <span className="value">{exam.deviationValue}</span>
                  </div>
                  <div className="card-info-row">
                    <span className="label">更新日:</span>
                    <span className="value">{exam.updatedAt}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-info">受験情報</button>
                  <button className="btn-exam">受験管理</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ワークスペースメンバーセクション */}
        <section className="home-section members-section">
          <h2 className="section-title">ワークスペースメンバー</h2>
          <div className="section-content">
            {members.map((member) => (
              <div key={member.id} className="member-card">
                <span className="member-name">{member.name}</span>
                {member.role === 'owner' && (
                  <span className="member-badge">オーナー</span>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;