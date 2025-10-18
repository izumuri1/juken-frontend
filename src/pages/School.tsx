// src/components/School.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';  // ← 追加
import './School.scss';

// 型定義
interface SchoolInfo {
  id: string;  // ← 追加
  school_code: string;
  name: string;
  prefecture: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

interface SchoolDetails {
  id: string;
  has_cafeteria: boolean | null;
  has_uniform: boolean | null;
  commute_route: string;
  commute_time: number | null;
  nearest_station: string;
  official_website: string;
}

const School: React.FC = () => {
  const { schoolCode } = useParams<{ schoolCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();  // ← 追加

  // データ
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);  // ← 追加

  // フォーム入力状態
  const [hasCafeteria, setHasCafeteria] = useState<boolean | null>(null);
  const [hasUniform, setHasUniform] = useState<boolean | null>(null);
  const [commuteRoute, setCommuteRoute] = useState('');
  const [commuteTime, setCommuteTime] = useState<number | null>(null);
  const [nearestStation, setNearestStation] = useState('');
  const [officialWebsite, setOfficialWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // メニュー表示状態
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ワークスペース情報（仮）
  const [workspaceName] = useState('田中家の中学受験');
  const [workspaceOwner] = useState('田中太郎');

  // データ取得
  // データ取得
  useEffect(() => {
        const fetchSchoolData = async () => {
        if (!schoolCode) {
            setError('学校コードが指定されていません');
            setLoading(false);
            return;
        }

        if (!user) {
            setError('ユーザー情報が取得できません');
            setLoading(false);
            return;
        }

        try {
            // 1. ワークスペースIDを取得
            const { data: workspaceData, error: workspaceError } = await supabase
            .from('workspace_members')
            .select('workspace_id')
            .eq('user_id', user.id)
            .single();

            if (workspaceError) throw workspaceError;
            if (!workspaceData) throw new Error('ワークスペースが見つかりません');

            setWorkspaceId(workspaceData.workspace_id);

            // 2. 学校基礎情報を取得（idを含める）
            const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .select('id, school_code, name, prefecture, address, latitude, longitude')
            .eq('school_code', schoolCode)
            .single();

            if (schoolError) throw schoolError;
            if (!schoolData) throw new Error('学校が見つかりません');

            setSchoolInfo(schoolData);

            // 3. 学校詳細情報を取得（ユーザー入力データ）
            const { data: detailsData } = await supabase
            .from('school_details')
            .select('*')
            .eq('school_id', schoolData.id)
            .eq('workspace_id', workspaceData.workspace_id)
            .single();

            if (detailsData) {
              setSchoolDetails(detailsData);
              setHasCafeteria(detailsData.has_cafeteria);
              setHasUniform(detailsData.has_uniform);
              setCommuteRoute(detailsData.commute_route || '');
              setCommuteTime(detailsData.commute_time);
              setNearestStation(detailsData.nearest_station || '');
              setOfficialWebsite(detailsData.official_website || '');
            }
        } catch (err) {
            console.error('データ取得エラー:', err);
            setError('学校情報の取得に失敗しました');
        } finally {
            setLoading(false);
        }
        };

        fetchSchoolData();
    }, [schoolCode, user]);

  // 学校情報登録・更新
  // 学校情報登録・更新
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspaceId || !schoolInfo?.id) {
      alert('ワークスペース情報または学校情報が取得できていません');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('school_details')
        .upsert({
          workspace_id: workspaceId,
          school_id: schoolInfo.id,
          has_cafeteria: hasCafeteria,
          has_uniform: hasUniform,
          commute_route: commuteRoute,
          commute_time: commuteTime,
          nearest_station: nearestStation,
          official_website: officialWebsite,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'workspace_id,school_id'
        });

      if (error) throw error;

      alert('学校情報を登録しました');

      // データを再取得して表示を更新
      const { data: detailsData } = await supabase
        .from('school_details')
        .select('*')
        .eq('school_id', schoolInfo.id)
        .eq('workspace_id', workspaceId)
        .single();

      if (detailsData) {
        setSchoolDetails(detailsData);
      }
    } catch (err) {
      console.error('登録エラー:', err);
      alert('学校情報の登録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 学校詳細情報の削除
  const handleDelete = async () => {
    if (!confirm('学校情報を削除してもよろしいですか?')) return;

    if (!schoolDetails?.id) {
      alert('削除する情報が見つかりません');
      return;
    }

    try {
      const { error } = await supabase
        .from('school_details')
        .delete()
        .eq('id', schoolDetails.id);

      if (error) throw error;

      alert('学校情報を削除しました');
        setSchoolDetails(null);
        setHasCafeteria(null);
        setHasUniform(null);
        setCommuteRoute('');
        setCommuteTime(null);
        setNearestStation('');
        setOfficialWebsite('');
    } catch (err) {
      console.error('削除エラー:', err);
      alert('学校情報の削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="school-container">
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (error || !schoolInfo) {
    return (
      <div className="school-container">
        <div className="error-message">{error || '学校情報が見つかりません'}</div>
        <button onClick={() => navigate('/home')} className="btn-primary">
          Homeへ戻る
        </button>
      </div>
    );
  }

  return (
    <div className="school-container">
      {/* ヘッダー */}
      <header className="school-header">
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
            <button className="close-button" onClick={() => setIsMenuOpen(false)}>
              ✕
            </button>
            <ul>
              <li>
                <button onClick={() => navigate('/home')}>Home</button>
              </li>
              <li>
                <button onClick={() => setIsMenuOpen(false)}>School</button>
              </li>
              <li>
                <button onClick={() => alert('未実装')}>Target</button>
              </li>
              <li>
                <button onClick={() => alert('未実装')}>Exam</button>
              </li>
              <li>
                <button onClick={() => alert('未実装')}>Comparison</button>
              </li>
              <li>
                <button onClick={() => alert('未実装')}>Task</button>
              </li>
              <li className="divider"></li>
              <li>
                <button onClick={() => alert('未実装')}>ワークスペース選択</button>
              </li>
              <li>
                <button onClick={() => alert('未実装')}>チュートリアル</button>
              </li>
              <li>
                <button onClick={() => alert('未実装')}>ログアウト</button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <main className="school-main">
        {/* 学校情報セクション */}
        <section className="school-section school-info-section">
          <h2 className="section-title">学校情報</h2>
          <div className="info-card">
            <div className="info-row">
              <span className="label">学校名:</span>
              <span className="value">{schoolInfo.name}</span>
            </div>
            <div className="info-row">
              <span className="label">都道府県:</span>
              <span className="value">{schoolInfo.prefecture}</span>
            </div>
            <div className="info-row">
              <span className="label">学校所在地:</span>
              <span className="value">{schoolInfo.address}</span>
            </div>
          </div>

          {/* 地図表示エリア（TODO: Leaflet.js実装） */}
          <div className="map-container">
            <div className="map-placeholder">
              {schoolInfo.latitude && schoolInfo.longitude ? (
                <p>地図表示エリア（OpenStreetMap + Leaflet.js）</p>
              ) : (
                <p>位置情報が登録されていません</p>
              )}
            </div>
          </div>
        </section>

        {/* 学校情報入力セクション */}
        <section className="school-section school-input-section">
          <h2 className="section-title">学校情報入力</h2>
          <form onSubmit={handleSubmit} className="school-form">
            <div className="form-group">
              <label className="form-label">学食・購買の有無</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="cafeteria"
                    checked={hasCafeteria === true}
                    onChange={() => setHasCafeteria(true)}
                  />
                  あり
                </label>
                <label>
                  <input
                    type="radio"
                    name="cafeteria"
                    checked={hasCafeteria === false}
                    onChange={() => setHasCafeteria(false)}
                  />
                  なし
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">制服の有無</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="uniform"
                    checked={hasUniform === true}
                    onChange={() => setHasUniform(true)}
                  />
                  あり
                </label>
                <label>
                  <input
                    type="radio"
                    name="uniform"
                    checked={hasUniform === false}
                    onChange={() => setHasUniform(false)}
                  />
                  なし
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">通学経路</label>
              <textarea
                className="form-textarea"
                value={commuteRoute}
                onChange={(e) => setCommuteRoute(e.target.value)}
                placeholder="例: 自宅→〇〇駅→△△駅→徒歩10分"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">自宅からの通学所要時間（分）</label>
              <input
                type="number"
                className="form-input"
                value={commuteTime || ''}
                onChange={(e) =>
                  setCommuteTime(e.target.value ? parseInt(e.target.value) : null)
                }
                placeholder="例: 45"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">最寄駅</label>
              <input
                type="text"
                className="form-input"
                value={nearestStation}
                onChange={(e) => setNearestStation(e.target.value)}
                placeholder="例: 本郷三丁目駅"
              />
            </div>

            <div className="form-group">
              <label className="form-label">公式サイトURL</label>
              <input
                type="url"
                className="form-input"
                value={officialWebsite}
                onChange={(e) => setOfficialWebsite(e.target.value)}
                placeholder="例: https://www.example.com"
              />
            </div>

            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? '登録中...' : '登録'}
            </button>
          </form>
        </section>

        {/* 学校情報表示セクション */}
        {schoolDetails && (
          <section className="school-section school-display-section">
            <h2 className="section-title">登録済み学校情報</h2>
            <div className="info-card">
              <div className="info-row">
                <span className="label">学食・購買:</span>
                <span className="value">
                  {schoolDetails.has_cafeteria === null
                    ? '未設定'
                    : schoolDetails.has_cafeteria
                    ? 'あり'
                    : 'なし'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">制服:</span>
                <span className="value">
                  {schoolDetails.has_uniform === null
                    ? '未設定'
                    : schoolDetails.has_uniform
                    ? 'あり'
                    : 'なし'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">通学経路:</span>
                <span className="value">{schoolDetails.commute_route || '未設定'}</span>
              </div>
              <div className="info-row">
                <span className="label">通学時間:</span>
                <span className="value">
                  {schoolDetails.commute_time ? `${schoolDetails.commute_time}分` : '未設定'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">最寄駅:</span>
                <span className="value">{schoolDetails.nearest_station || '未設定'}</span>
              </div>
              <div className="info-row">
                <span className="label">公式サイト:</span>
                <span className="value">
                  {schoolDetails.official_website ? (
                    <a 
                      href={schoolDetails.official_website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="website-link"
                    >
                      {schoolDetails.official_website}
                    </a>
                  ) : (
                    '未設定'
                  )}
                </span>
              </div>
              <div className="card-actions">
                <button className="btn-edit" onClick={() => alert('編集機能は未実装')}>
                  編集
                </button>
                <button className="btn-delete" onClick={handleDelete}>
                  削除
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ボタンセクション */}
        <section className="school-section action-buttons-section">
          <button
            className="btn-register"
            onClick={() => alert('Target画面への遷移は未実装')}
          >
            志望校登録
          </button>
          <button className="btn-home" onClick={() => navigate('/home')}>
            Home
          </button>
        </section>
      </main>
    </div>
  );
};

export default School;