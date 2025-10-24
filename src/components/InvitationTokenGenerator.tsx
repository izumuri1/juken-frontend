// src/components/InvitationTokenGenerator.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import './InvitationTokenGenerator.scss';

interface InvitationTokenGeneratorProps {
  workspaceId: string;
  workspaceName: string;
}

export function InvitationTokenGenerator({ 
  workspaceId, 
  workspaceName 
}: InvitationTokenGeneratorProps) {
  const [inviteUrl, setInviteUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateInviteToken = async () => {
    setIsGenerating(true);
    setError('');

    try {
      // 24時間後の有効期限を設定
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('ユーザー情報が取得できません');
      }

      const { data, error: insertError } = await supabase
        .from('invitation_tokens')
        .insert({
          workspace_id: workspaceId,
          created_by: userData.user.id,
          expires_at: expiresAt.toISOString(),
          max_uses: 1,
          current_uses: 0
        })
        .select('token')
        .single();

      if (insertError) throw insertError;

      const url = `${window.location.origin}/invite/${data.token}`;
      setInviteUrl(url);
    } catch (err: any) {
      logger.error('招待トークン生成エラー:', err);
      setError('招待リンクの生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      alert('招待リンクをコピーしました');
    } catch (err) {
      logger.error('コピー失敗:', err);
      alert('コピーに失敗しました');
    }
  };

  return (
    <div className="invitation-token-generator">
      {!inviteUrl ? (
        <button
          className="btn-generate-invite"
          onClick={generateInviteToken}
          disabled={isGenerating}
        >
          {isGenerating ? '生成中...' : '招待リンクを生成'}
        </button>
      ) : (
        <div className="invite-url-container">
          <p className="invite-description">
            このリンクを共有して、{workspaceName}に招待しましょう
          </p>
          <div className="invite-url-box">
            <input
              type="text"
              value={inviteUrl}
              readOnly
              className="invite-url-input"
            />
            <button
              className="btn-copy"
              onClick={copyToClipboard}
            >
              コピー
            </button>
          </div>
          <p className="invite-expiry">有効期限: 24時間</p>
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}