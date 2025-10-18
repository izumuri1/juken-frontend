// src/components/School.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from "../contexts/AuthContext";
import { PageHeader } from '../components/common/PageHeader'; // 追加
import { InfoCard } from '../components/common/InfoCard'; // 追加
import { SchoolMap } from '../components/SchoolMap';
import { useWorkspace } from '../hooks/useWorkspace'; // ← 追加
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
  const { workspaceId, schoolCode } = useParams<{ workspaceId: string; schoolCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // データ
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // フォーム入力状態
  const [hasCafeteria, setHasCafeteria] = useState<boolean | null>(null);
  const [hasUniform, setHasUniform] = useState<boolean | null>(null);
  const [commuteRoute, setCommuteRoute] = useState('');
  const [commuteTime, setCommuteTime] = useState<number | null>(null);
  const [nearestStation, setNearestStation] = useState('');
  const [officialWebsite, setOfficialWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // 編集モードの状態を追加

  // メニュー表示状態
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ワークスペース情報（カスタムフックに置き換え）
  const { workspaceName, workspaceOwner } = useWorkspace(workspaceId);

  // データ取得
    useEffect(() => {
    const fetchSchoolData = async () => {
    console.log('=== School画面データ取得開始 ===');
    console.log('workspaceId:', workspaceId); // ← 追加
    console.log('schoolCode:', schoolCode);
    console.log('user:', user);

    if (!schoolCode) {
        console.error('学校コードが未指定');
        setError('学校コードが指定されていません');
        setLoading(false);
        return;
    }

    if (!workspaceId) { // ← userからworkspaceIdに変更
        console.error('ワークスペースIDが未指定');
        setError('ワークスペースIDが指定されていません');
        setLoading(false);
        return;
    }

    try {
        // 1. 学校基礎情報を取得
        console.log('ステップ1: 学校基礎情報取得中...');
          const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('id, school_code, name, prefecture, address, latitude, longitude')
          .eq('school_code', schoolCode)
          .single();

          console.log('学校情報取得結果:', schoolData);
          console.log('学校情報取得エラー:', schoolError);

          if (schoolError) {
              console.error('学校情報取得でエラー:', schoolError);
              throw schoolError;
          }
          if (!schoolData) {
              console.error('学校が見つかりません');
              throw new Error('学校が見つかりません');
          }

          setSchoolInfo(schoolData);
          console.log('学校情報設定完了:', schoolData);

          // 2. 学校詳細情報を取得（ユーザー入力データ）
          // ※ワークスペース情報の取得処理は削除（useWorkspaceフックで処理）
          console.log('ステップ2: 学校詳細情報取得中...');
          console.log('検索条件 - school_id:', schoolData.id);
          console.log('検索条件 - workspace_id:', workspaceId);
          
          const { data: detailsData, error: detailsError } = await supabase
          .from('school_details')
          .select('*')
          .eq('school_id', schoolData.id)
          .eq('workspace_id', workspaceId) // ← workspaceData.workspace_idからworkspaceIdに変更
          .maybeSingle();

          console.log('学校詳細情報取得結果:', detailsData);
          console.log('学校詳細情報取得エラー:', detailsError);

          if (detailsError) {
              console.error('学校詳細情報取得でエラー:', detailsError);
              throw detailsError;
          }

          if (detailsData) {
            console.log('学校詳細情報が存在します');
            setSchoolDetails(detailsData);
            setHasCafeteria(detailsData.has_cafeteria);
            setHasUniform(detailsData.has_uniform);
            setCommuteRoute(detailsData.commute_route || '');
            setCommuteTime(detailsData.commute_time);
            setNearestStation(detailsData.nearest_station || '');
            setOfficialWebsite(detailsData.official_website || '');
            setIsEditing(false); // 登録済みの場合は編集モードをOFFに
          } else {
            console.log('学校詳細情報は未登録です');
            setIsEditing(true); // 未登録の場合は編集モードをONに
          }
      } catch (err) {
          console.error('=== データ取得エラー ===');
          console.error('エラー詳細:', err);
          console.error('エラーメッセージ:', (err as Error).message);
          setError('学校情報の取得に失敗しました');
      } finally {
          setLoading(false);
          console.log('=== School画面データ取得完了 ===');
      }
      };

      fetchSchoolData();
  }, [schoolCode, workspaceId]); // ← userからworkspaceIdに変更
          
  // 学校情報登録・更新
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // === 認証状態デバッグ ===
    console.log('=== 認証確認 ===');
    console.log('AuthContext user:', user);
    
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    console.log('Supabase getUser:', currentUser);
    console.log('workspaceId:', workspaceId);
    console.log('schoolInfo.id:', schoolInfo?.id);

    // workspace_membersにレコードが存在するか確認
    if (currentUser) {
      const { data: memberCheck, error: memberError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('workspace_id', workspaceId);
      
      console.log('workspace_members確認:', memberCheck);
      console.log('workspace_membersエラー:', memberError);
    }
    // === デバッグ終了 ===

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
        setIsEditing(false); // 登録成功後は編集モードをOFFに
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
    if (!confirm('学校情報を削除してもよろしいですか?\n※志望校として登録されている場合は、志望校情報も削除されます。')) return;

    if (!schoolDetails?.id) {
      alert('削除する情報が見つかりません');
      return;
    }

    try {
      // 1. この学校の志望校情報を削除
      const { error: targetError } = await supabase
        .from('target_schools')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('school_id', schoolInfo!.id);

      if (targetError) {
        console.error('志望校情報削除エラー:', targetError);
        // エラーがあっても処理を続行
      }

      // 2. 学校詳細情報を削除
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
      setIsEditing(true); // 削除後は入力欄を表示
    } catch (err) {
      console.error('削除エラー:', err);
      alert('学校情報の削除に失敗しました');
    }
  };

// 志望校登録処理
const handleRegisterTarget = async () => {
  if (!schoolInfo || !workspaceId) {
    alert('学校情報が読み込まれていません');
    return;
  }

  try {
    setIsRegistering(true);
    
    // 既に志望校登録されているか確認
    const { data: existing, error: checkError } = await supabase
      .from('target_schools')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('school_id', schoolInfo.id)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      alert('この学校は既に志望校として登録されています');
      return;
    }

    // 初期データを設定して志望校登録
    const { error: insertError } = await supabase
      .from('target_schools')
      .insert({
        workspace_id: workspaceId,
        school_id: schoolInfo.id,
        child_impression: '（未入力）', // 必須項目のため初期値設定
      });

    if (insertError) throw insertError;

    // 登録成功後、target_schoolsのIDを取得
    const { data: newTarget } = await supabase
      .from('target_schools')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('school_id', schoolInfo.id)
      .single();

    alert('志望校として登録しました');
    // Home画面へ遷移（登録したIDをURLパラメータで渡す）
    navigate(`/workspace/${workspaceId}?scrollTo=${newTarget?.id || ''}`);
    
  } catch (err) {
    console.error('志望校登録エラー:', err);
    alert('志望校登録に失敗しました');
  } finally {
    setIsRegistering(false);
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
      <PageHeader
        workspaceName={workspaceName}
        workspaceOwner={workspaceOwner}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onMenuClose={() => setIsMenuOpen(false)}
        className="school-header"
      />

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

          {/* 地図表示エリア */}
          <div className="map-container">
            {schoolInfo.latitude && schoolInfo.longitude ? (
              <SchoolMap
                latitude={schoolInfo.latitude}
                longitude={schoolInfo.longitude}
                schoolName={schoolInfo.name}
              />
            ) : (
              <div className="map-placeholder">
                緯度経度情報がないため、地図を表示できません
              </div>
            )}
          </div>
        </section>

        {/* 学校情報入力セクション - 編集モードまたは未登録の場合のみ表示 */}
        {(isEditing || !schoolDetails) && (
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
            {schoolDetails && (
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setIsEditing(false)}
              >
                キャンセル
              </button>
            )}
          </form>
        </section>
        )}

        {/* 学校情報表示セクション - 登録済みかつ編集モードでない場合のみ表示 */}
        {schoolDetails && !isEditing && (
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
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
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
            onClick={handleRegisterTarget}
            disabled={isRegistering}
          >
            {isRegistering ? '登録中...' : '志望校登録'}
          </button>
          <button 
            className="btn-home" 
            onClick={() => navigate(`/workspace/${workspaceId}`)}
          >
            Home
          </button>
        </section>
      </main>
    </div>
  );
};

export default School;