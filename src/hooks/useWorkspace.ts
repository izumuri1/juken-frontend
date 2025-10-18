// src/hooks/useWorkspace.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useWorkspace = (workspaceId: string | undefined) => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceOwner, setWorkspaceOwner] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkspaceInfo = async () => {
      console.log('=== ワークスペース情報取得開始 ===');
      console.log('workspaceId:', workspaceId);
      
      if (!workspaceId) {
        console.log('workspaceIdが未設定のため処理をスキップ');
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

        console.log('ワークスペース取得結果:', workspace);
        console.log('ワークスペース取得エラー:', workspaceError);

        if (workspaceError) throw workspaceError;

        if (workspace) {
          console.log('ワークスペース名設定:', workspace.name);
          setWorkspaceName(workspace.name);

          console.log('オーナーID:', workspace.owner_id);
          
          // オーナー情報を取得
          const { data: owner, error: ownerError } = await supabase
            .from('users')
            .select('username')
            .eq('id', workspace.owner_id)
            .single();

          console.log('オーナー取得結果:', owner);
          console.log('オーナー取得エラー:', ownerError);

          if (ownerError) throw ownerError;

          if (owner) {
            console.log('オーナー名設定:', owner.username);
            setWorkspaceOwner(owner.username);
          }
        }
      } catch (err) {
        console.error('ワークスペース情報取得エラー:', err);
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