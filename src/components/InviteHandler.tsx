// src/components/InviteHandler.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { secureLogger } from '../utils/secureLogger';
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
      logger.log('招待トークン処理: ユーザー情報', user);
      logger.log('招待トークン処理: ワークスペース情報', processedData);

      if (user) {
        secureLogger.log('ログイン済みユーザー - joinWorkspace実行');
        await joinWorkspace(processedData, user.id);
      } else {
        secureLogger.log('未ログインユーザー - 新規登録画面へ');
        // ...
      }
      } catch (error: any) {
        secureLogger.error('招待トークン検証エラー:', error);
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

        secureLogger.log('既存メンバーチェック:', existingMember);

        if (existingMember) {
          secureLogger.log('既にメンバーです。ワークスペースへ遷移します。');
          navigate(`/workspace/${tokenData.workspace_id}`);
          return;
        }

        // ...

        if (tokenUpdateError) {
          secureLogger.warn('トークン更新エラー:', tokenUpdateError);
        }

        // ...

        } catch (error: any) {
          secureLogger.error('ワークスペース参加エラー:', error);
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