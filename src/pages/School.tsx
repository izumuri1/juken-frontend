// src/components/School.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger'; // ← 追加
import { useAuth } from "../contexts/AuthContext";
import { PageHeader } from '../components/common/PageHeader'; // 追加
import { InfoCard } from '../components/common/InfoCard'; // 追加
import { SchoolMap } from '../components/SchoolMap';
import { SchoolBasicInfo } from '../components/school/SchoolBasicInfo';
import { SchoolDetailsInfo } from '../components/school/SchoolDetailsInfo';
import { useWorkspace } from '../hooks/useWorkspace'; // ← 追加
import { ActionButtons } from '../components/common/ActionButtons'; // ← 追加
import { LoadingError } from '../components/common/LoadingError'; // ← 追加
import { PageLayout } from '../components/common/PageLayout';
import type { SchoolInfo, SchoolDetails } from '../types/school';
import { handleDatabaseError } from '../utils/errorHandler';
import { SCHOOL_ERROR_MESSAGES } from '../constants/errorMessages';
import './School.scss';

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
  const [isAlreadyTarget, setIsAlreadyTarget] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // isRegisteringは削除（使用しない）

  // メニュー表示状態
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ワークスペース情報（カスタムフックに置き換え）
  const { workspaceName, workspaceOwner } = useWorkspace(workspaceId);

  // データ取得
    useEffect(() => {
  const fetchSchoolData = async () => {
    logger.log('=== School画面データ取得開始 ===');
    logger.log('workspaceId:', workspaceId);
    logger.log('schoolCode:', schoolCode);
    logger.log('user:', user);

    if (!schoolCode) {
      logger.error('学校コードが未指定');
      setError('学校コードが指定されていません');
      setLoading(false);
      return;
    }

    if (!workspaceId) {
      logger.error('ワークスペースIDが未指定');
      setError('ワークスペースIDが指定されていません');
      setLoading(false);
      return;
    }

    try {
      // 1. 学校基礎情報を取得
      logger.log('ステップ1: 学校基礎情報取得中...');
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('id, school_code, name, prefecture, address, latitude, longitude')
        .eq('school_code', schoolCode)
        .single();

      logger.log('学校情報取得結果:', schoolData);
      logger.log('学校情報取得エラー:', schoolError);

      if (schoolError) {
        logger.error('学校情報取得でエラー:', schoolError);
        throw schoolError;
      }
      if (!schoolData) {
        logger.error('学校が見つかりません');
        throw new Error('学校が見つかりません');
      }

      setSchoolInfo(schoolData);
      logger.log('学校情報設定完了:', schoolData);

      // 2. 学校詳細情報を取得
      logger.log('ステップ2: 学校詳細情報取得中...');
      logger.log('検索条件 - school_id:', schoolData.id);
      logger.log('検索条件 - workspace_id:', workspaceId);
      
      // ...以下、同様のログもloggerに置き換え
      
    } catch (err) {
      logger.error('=== データ取得エラー ===');
      logger.error('エラー詳細:', err);
      logger.error('エラーメッセージ:', (err as Error).message);
      setError('学校情報の取得に失敗しました');
    } finally {
      setLoading(false);
      logger.log('=== School画面データ取得完了 ===');
    }
  };

  fetchSchoolData();
}, [schoolCode, workspaceId]);
          
  // 学校詳細情報の登録
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. 学校詳細情報を登録
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

      // 2. Home画面へ遷移（志望校一覧セクションへスクロール）
      navigate(`/workspace/${workspaceId}?scrollTo=${schoolInfo.id}`);

    } catch (err) {
      logger.error('登録エラー:', err);
      const errorMessage = handleDatabaseError(err as Error);
      alert(errorMessage);
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
        logger.error('志望校情報削除エラー:', targetError);
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
      logger.error('削除エラー:', err);
      alert(SCHOOL_ERROR_MESSAGES.DELETE_FAILED);
    }
  };

// この関数は削除（handleSubmitに統合）

  if (loading) {
    return (
      <div className="school-container">
        <LoadingError loading={true} />
      </div>
    );
  }

  if (error || !schoolInfo) {
    return (
      <div className="school-container">
        <LoadingError 
          error={error || '学校情報が見つかりません'} 
          homeLink={`/workspace/${workspaceId}`}
        />
      </div>
    );
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
      {/* 学校情報セクション */}
      <section className="school-section school-info-section">
        <h2 className="section-title">学校情報</h2>
        
        <SchoolBasicInfo
          name={schoolInfo.name}
          prefecture={schoolInfo.prefecture}
          address={schoolInfo.address}
        />

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
              {isSubmitting ? '登録中...' : '学校情報登録'}
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
            <div className="school-details-wrapper">
              <SchoolDetailsInfo
                hasCafeteria={schoolDetails.has_cafeteria}
                hasUniform={schoolDetails.has_uniform}
                commuteRoute={schoolDetails.commute_route}
                commuteTime={schoolDetails.commute_time}
                nearestStation={schoolDetails.nearest_station}
                officialWebsite={schoolDetails.official_website}
              />
              
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
      </PageLayout>
    );
  };

export default School;