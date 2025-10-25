// src/hooks/useWorkspace.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { secureLogger } from '../utils/secureLogger';

export const useWorkspace = (workspaceId: string | undefined) => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceOwner, setWorkspaceOwner] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const fetchWorkspaceInfo = async () => {
    secureLogger.log('=== ワークスペース情報取得開始 ===');
    secureLogger.log('workspaceId:', workspaceId);
    
    if (!workspaceId) {
      secureLogger.log('workspaceIdが未設定のため処理をスキップ');
      setLoading(false);
      return;
    }

    try {
      // ワークスペース情報を取得
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('name, owner_id')
        .eq('id', workspaceId)
        .single();

      secureLogger.log('ワークスペース取得結果:', workspace);
      secureLogger.log('ワークスペース取得エラー:', workspaceError);

      if (workspaceError) throw workspaceError;

      if (workspace) {
        secureLogger.log('ワークスペース名設定:', workspace.name);
        setWorkspaceName(workspace.name);

        secureLogger.log('オーナーID:', workspace.owner_id);
        
        // オーナー情報を取得
        const { data: owner, error: ownerError } = await supabase
          .from('users')
          .select('username')
          .eq('id', workspace.owner_id)
          .single();

        secureLogger.log('オーナー取得結果:', owner);
        secureLogger.log('オーナー取得エラー:', ownerError);

        if (ownerError) throw ownerError;

        if (owner) {
          secureLogger.log('オーナー名設定:', owner.username);
          setWorkspaceOwner(owner.username);
        }
      }
    } catch (err) {
      secureLogger.error('ワークスペース情報取得エラー:', err);
      setWorkspaceName('ワークスペース');
      setWorkspaceOwner('');
      setError('ワークスペース情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  fetchWorkspaceInfo();
}, [workspaceId]);

  return { workspaceName, workspaceOwner, loading, error };
};