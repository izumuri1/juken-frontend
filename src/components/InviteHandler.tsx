// src/components/InviteHandler.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './InviteHandler.scss';

interface InviteTokenData {
  id: string;
  token: string;
  workspace_id: string;
  created_by: string;
  expires_at: string;
  max_uses: number;
  current_uses: number;
  workspaces: {
    id: string;
    name: string;
    owner_id: string;
  } | null;
}

export function InviteHandler() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteData, setInviteData] = useState<InviteTokenData | null>(null);

  useEffect(() => {
    if (!token) {
        setError('招待URLが無効です');
        setLoading(false);
        return;
    }

    // 認証状態の読み込みが完了するまで待つ
    if (authLoading) {
        return;
    }

    validateInviteToken();
    }, [token, authLoading]);

  const validateInviteToken = async () => {
    try {
      setLoading(true);
      
      const { data: tokenData, error: tokenError } = await supabase
        .from('invitation_tokens')
        .select(`
          id,
          token,
          workspace_id,
          created_by,
          expires_at,
          max_uses,
          current_uses,
          workspaces (
            id,
            name,
            owner_id
          )
        `)
        .eq('token', token)
        .single();

      if (tokenError) {
        console.error('トークン取得エラー:', tokenError);
        setError('招待リンクが見つかりません');
        return;
      }

      // 有効期限チェック
      const now = new Date();
      const expiresAt = new Date(tokenData.expires_at);
      
      if (now > expiresAt) {
        setError('招待リンクの有効期限が切れています');
        return;
      }

      // 使用回数チェック
      if (tokenData.current_uses >= tokenData.max_uses) {
        setError('この招待リンクは既に使用されています');
        return;
      }

      const processedData: InviteTokenData = {
        ...tokenData,
        workspaces: Array.isArray(tokenData.workspaces) 
          ? tokenData.workspaces[0] || null 
          : tokenData.workspaces
      };

      setInviteData(processedData);

      // ログイン状態チェック
        console.log('招待トークン処理: ユーザー情報', user);
        console.log('招待トークン処理: ワークスペース情報', processedData);

        if (user) {
        console.log('ログイン済みユーザー - joinWorkspace実行');
        await joinWorkspace(processedData, user.id);
        } else {
        console.log('未ログインユーザー - 新規登録画面へ');
        // 未ログインの場合は新規登録画面へ
        sessionStorage.setItem('pendingInvite', JSON.stringify({
          token: token,
          workspaceId: processedData.workspace_id,
          workspaceName: processedData.workspaces?.name || 'ワークスペース'
        }));
        
        navigate(`/signup?inviteToken=${token}&workspaceName=${encodeURIComponent(processedData.workspaces?.name || 'ワークスペース')}`);
      }

    } catch (error: any) {
      console.error('招待トークン検証エラー:', error);
      setError('招待リンクの処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const joinWorkspace = async (tokenData: InviteTokenData, userId: string) => {
    try {
      setLoading(true);

      // 既にメンバーかチェック
        const { data: existingMember, error: memberCheckError } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', tokenData.workspace_id)
        .eq('user_id', userId)
        .maybeSingle();

        console.log('既存メンバーチェック:', existingMember);

        if (existingMember) {
        console.log('既にメンバーです。ワークスペースへ遷移します。');
        navigate(`/workspace/${tokenData.workspace_id}`);
        return;
        }

      // ワークスペースメンバーとして追加
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: tokenData.workspace_id,
          user_id: userId,
          role: 'member'
        });

      if (memberError) throw memberError;

      // トークンの使用回数を更新
      const { error: tokenUpdateError } = await supabase
        .from('invitation_tokens')
        .update({
          current_uses: tokenData.current_uses + 1,
          used_by: userId,
          used_at: new Date().toISOString()
        })
        .eq('id', tokenData.id);

      if (tokenUpdateError) {
        console.warn('トークン更新エラー:', tokenUpdateError);
      }

      navigate(`/workspace/${tokenData.workspace_id}`);

    } catch (error: any) {
      console.error('ワークスペース参加エラー:', error);
      setError('ワークスペースへの参加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="invite-processing-container">
        <div className="invite-processing-card">
          <h1 className="logo">どうする中学受験？</h1>
          <div className="processing-content">
            <p className="processing-message">招待を処理中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invite-error-container">
        <div className="invite-error-card">
          <h1 className="logo">どうする中学受験？</h1>
          <div className="error-content">
            <h2 className="error-title">招待リンクエラー</h2>
            <p className="error-message">{error}</p>
            <button 
              className="btn-back"
              onClick={() => navigate('/login')}
            >
              ログイン画面に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="invite-processing-container">
      <div className="invite-processing-card">
        <h1 className="logo">どうする中学受験？</h1>
        <div className="processing-content">
          <p className="processing-message">
            {inviteData?.workspaces?.name || 'ワークスペース'} への参加を準備しています
          </p>
        </div>
      </div>
    </div>
  );
}