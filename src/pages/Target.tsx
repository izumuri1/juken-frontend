// src/pages/Target.tsx
// Target画面: 志望校情報の登録・管理

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PageLayout } from '../components/common/PageLayout';
import { SchoolBasicInfo } from '../components/school/SchoolBasicInfo';
import { SchoolMap } from '../components/school/SchoolMap';
import { SchoolDetailsInfo } from '../components/school/SchoolDetailsInfo';
import './Target.scss';

interface School {
  id: string;  // ← 追加: データベースのid
  school_code: string;
  name: string;
  prefecture: string;
  address: string;
  website_url?: string;
  latitude?: number;
  longitude?: number;
}

interface SchoolDetails {
  cafeteria_available: boolean;
  uniform_required: boolean;
  commute_route?: string;
  commute_time?: number;
  nearest_station?: string;
}

interface TargetInfo {
  id: string;
  event_date?: string;
  event_name?: string;
  participants?: string;
  access_method?: string;
  talked_with?: string;
  child_aspiration?: number;
  child_impression?: string;
  parent_aspiration?: number;
  parent_impression?: string;
  updated_at: string;
}

function Target() {
  const { workspaceId, schoolCode } = useParams<{ workspaceId: string; schoolCode: string }>();
  const navigate = useNavigate();

  const [school, setSchool] = useState<School | null>(null);
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null);
  const [targetInfos, setTargetInfos] = useState<TargetInfo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // PageLayout用の状態追加
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceOwner, setWorkspaceOwner] = useState('');

  // フォーム状態
  const [formData, setFormData] = useState({
    eventDate: '',
    eventName: '',
    participants: '',
    accessMethod: '',
    talkedTo: '',
    childAspiration: 3,
    childImpression: '',
    parentAspiration: 3,
    parentImpression: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // 学校情報とschool_details、target_schoolsを取得
  useEffect(() => {
    const fetchData = async () => {
      if (!schoolCode || !workspaceId) return;

      try {
        setLoading(true);

        // ワークスペース情報を取得
        const { data: workspaceData } = await supabase
          .from('workspaces')
          .select('name, owner_id')
          .eq('id', workspaceId)
          .single();

        if (workspaceData) {
          setWorkspaceName(workspaceData.name);
          
          const { data: ownerData } = await supabase
            .from('users')
            .select('username')
            .eq('id', workspaceData.owner_id)
            .single();
          
          if (ownerData) {
            setWorkspaceOwner(ownerData.username);
          }
        }

        // 学校基本情報
            const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .select('*')
            .eq('school_code', schoolCode)
            .single();

            if (schoolError) throw schoolError;
            setSchool(schoolData);

            // school_details (school_idで検索)
            const { data: detailsData } = await supabase
            .from('school_details')
            .select('*')
            .eq('school_id', schoolData.id)
            .eq('workspace_id', workspaceId)
            .single();

            setSchoolDetails(detailsData);

        // target_schools (志望校情報) - school_idで検索
        const { data: targetData, error: targetError } = await supabase
        .from('target_schools')
        .select('*')
        .eq('school_id', schoolData.id)
        .eq('workspace_id', workspaceId)
        .order('event_date', { ascending: false });

        if (targetError) throw targetError;
        setTargetInfos(targetData || []);

      } catch (error) {
        console.error('データ取得エラー:', error);
        setErrorMessage('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolCode, workspaceId]);

  // フォーム入力ハンドラー
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  // 志望校情報登録
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // バリデーション
    if (!formData.childImpression.trim()) {
      setErrorMessage('感想（子供）は必須項目です');
      return;
    }

    try {
      if (!school) return;

        const targetData = {
        school_id: school.id,  // school_codeではなくschool_idを使用
        workspace_id: workspaceId,
        event_date: formData.eventDate || null,
        event_name: formData.eventName || null,
        participants: formData.participants || null,
        access_method: formData.accessMethod || null,
        talked_with: formData.talkedTo || null,
        child_aspiration: formData.childAspiration,
        child_impression: formData.childImpression,
        parent_aspiration: formData.parentAspiration,
        parent_impression: formData.parentImpression || null
        };

      if (editingId) {
        // 更新
        const { error } = await supabase
          .from('target_schools')
          .update(targetData)
          .eq('id', editingId);

        if (error) throw error;
        
        setTargetInfos(prev =>
          prev.map(info => info.id === editingId ? { ...info, ...targetData } : info)
        );
        setEditingId(null);
      } else {
        // 新規登録
        const { data, error } = await supabase
          .from('target_schools')
          .insert([targetData])
          .select()
          .single();

        if (error) throw error;
        setTargetInfos(prev => [data, ...prev]);
      }

      // フォームリセット
      setFormData({
        eventDate: '',
        eventName: '',
        participants: '',
        accessMethod: '',
        talkedTo: '',
        childAspiration: 3,
        childImpression: '',
        parentAspiration: 3,
        parentImpression: ''
      });

    } catch (error) {
      console.error('登録エラー:', error);
      setErrorMessage('登録に失敗しました');
    }
  };

  // 編集開始
  const handleEdit = (info: TargetInfo) => {
    setFormData({
      eventDate: info.event_date || '',
      eventName: info.event_name || '',
      participants: info.participants || '',
      accessMethod: info.access_method || '',
      talkedTo: info.talked_with || '',
      childAspiration: info.child_aspiration || 3,
      childImpression: info.child_impression || '',
      parentAspiration: info.parent_aspiration || 3,
      parentImpression: info.parent_impression || ''
    });
    setEditingId(info.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 削除
  const handleDelete = async (id: string) => {
    if (!window.confirm('この志望校情報を削除しますか?')) return;

    try {
      const { error } = await supabase
        .from('target_schools')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTargetInfos(prev => prev.filter(info => info.id !== id));
    } catch (error) {
      console.error('削除エラー:', error);
      setErrorMessage('削除に失敗しました');
    }
  };


  if (loading) {
    return (
      <PageLayout
        workspaceName={workspaceName}
        workspaceOwner={workspaceOwner}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onMenuClose={() => setIsMenuOpen(false)}
      >
        <div className="loading-message">読み込み中...</div>
      </PageLayout>
    );
  }

  if (!school) {
    return (
      <PageLayout
        workspaceName={workspaceName}
        workspaceOwner={workspaceOwner}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onMenuClose={() => setIsMenuOpen(false)}
      >
        <div className="error-message">学校情報が見つかりません</div>
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
    >
      <div className="target-page">
        {/* 学校情報セクション */}
        <section className="target-section school-info-section">
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

        {schoolDetails && (
            <SchoolDetailsInfo
            hasCafeteria={schoolDetails.cafeteria_available}
            hasUniform={schoolDetails.uniform_required}
            commuteRoute={schoolDetails.commute_route}
            commuteTime={schoolDetails.commute_time}
            nearestStation={schoolDetails.nearest_station}
            officialWebsite={schoolDetails.official_website}
            />
        )}
        </section>

        {/* 志望校情報入力セクション */}
        <section className="target-section target-input-section">
          <h2 className="section-title">
            {editingId ? '志望校情報編集' : '志望校情報入力'}
          </h2>
          
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <form onSubmit={handleSubmit} className="target-form">
            <div className="form-group">
              <label htmlFor="eventDate">学校イベント参加日</label>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="eventName">参加イベント</label>
              <input
                type="text"
                id="eventName"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                placeholder="例: 学校説明会、文化祭"
              />
            </div>

            <div className="form-group">
              <label htmlFor="participants">参加者</label>
              <input
                type="text"
                id="participants"
                name="participants"
                value={formData.participants}
                onChange={handleInputChange}
                placeholder="例: 子供、父、母"
              />
            </div>

            <div className="form-group">
              <label htmlFor="accessMethod">行き方</label>
              <input
                type="text"
                id="accessMethod"
                name="accessMethod"
                value={formData.accessMethod}
                onChange={handleInputChange}
                placeholder="例: 電車、車"
              />
            </div>

            <div className="form-group">
              <label htmlFor="talkedTo">しゃべった相手</label>
              <input
                type="text"
                id="talkedTo"
                name="talkedTo"
                value={formData.talkedTo}
                onChange={handleInputChange}
                placeholder="例: 先生、在校生"
              />
            </div>

            <div className="form-group">
              <label htmlFor="childAspiration">志望度（子供）</label>
              <input
                type="range"
                id="childAspiration"
                name="childAspiration"
                min="1"
                max="5"
                value={formData.childAspiration}
                onChange={handleNumberChange}
              />
              <span className="range-value">{formData.childAspiration}</span>
            </div>

            <div className="form-group">
              <label htmlFor="childImpression">感想（子供）<span className="required">*</span></label>
              <textarea
                id="childImpression"
                name="childImpression"
                value={formData.childImpression}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="子供の感想を入力してください"
              />
            </div>

            <div className="form-group">
              <label htmlFor="parentAspiration">志望度（親）</label>
              <input
                type="range"
                id="parentAspiration"
                name="parentAspiration"
                min="1"
                max="5"
                value={formData.parentAspiration}
                onChange={handleNumberChange}
              />
              <span className="range-value">{formData.parentAspiration}</span>
            </div>

            <div className="form-group">
              <label htmlFor="parentImpression">感想（親）</label>
              <textarea
                id="parentImpression"
                name="parentImpression"
                value={formData.parentImpression}
                onChange={handleInputChange}
                rows={4}
                placeholder="親の感想を入力してください"
              />
            </div>

            <div className="form-actions">
              {editingId && (
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      eventDate: '',
                      eventName: '',
                      participants: '',
                      accessMethod: '',
                      talkedTo: '',
                      childAspiration: 3,
                      childImpression: '',
                      parentAspiration: 3,
                      parentImpression: ''
                    });
                  }}
                >
                  キャンセル
                </button>
              )}
              <button type="submit" className="btn btn-submit">
                {editingId ? '更新' : '志望校情報登録'}
              </button>
            </div>
          </form>
        </section>

        {/* 志望校情報表示セクション */}
        <section className="target-section target-list-section">
          <h2 className="section-title">登録済み志望校情報</h2>
          
          {targetInfos.length === 0 ? (
            <div className="empty-message">
              <p>まだ志望校情報が登録されていません</p>
            </div>
          ) : (
            <div className="target-list">
              {targetInfos.map(info => (
                <div key={info.id} className="target-card">
                  {info.event_date && (
                    <div className="info-row">
                      <span className="label">参加日</span>
                      <span className="value">
                        {new Date(info.event_date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  )}
                  {info.event_name && (
                    <div className="info-row">
                      <span className="label">イベント</span>
                      <span className="value">{info.event_name}</span>
                    </div>
                  )}
                  {info.participants && (
                    <div className="info-row">
                      <span className="label">参加者</span>
                      <span className="value">{info.participants}</span>
                    </div>
                  )}
                  {info.access_method && (
                    <div className="info-row">
                      <span className="label">行き方</span>
                      <span className="value">{info.access_method}</span>
                    </div>
                  )}
                  {info.talked_with && (
                    <div className="info-row">
                      <span className="label">相手</span>
                      <span className="value">{info.talked_with}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="label">志望度（子）</span>
                    <span className={`value desire-badge badge-level-${info.child_aspiration}`}>
                      {info.child_aspiration}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">感想（子）</span>
                    <span className="value impression">{info.child_impression}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">志望度（親）</span>
                    <span className={`value desire-badge badge-level-${info.parent_aspiration}`}>
                      {info.parent_aspiration}
                    </span>
                  </div>
                  {info.parent_impression && (
                    <div className="info-row">
                      <span className="label">感想（親）</span>
                      <span className="value impression">{info.parent_impression}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="label">更新日</span>
                    <span className="value">
                      {new Date(info.updated_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  
                  <div className="card-actions">
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEdit(info)}
                    >
                      編集
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(info.id)}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ボタンセクション */}
        <section className="target-section buttons-section">
          <button
            className="btn btn-home"
            onClick={() => navigate(`/workspace/${workspaceId}`)}
          >
            Home
          </button>
        </section>
      </div>
    </PageLayout>
  );
}

export default Target;