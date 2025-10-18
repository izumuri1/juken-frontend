import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface WorkspaceMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  username: string;
}

interface WorkspaceMembersProps {
  workspaceId: string;
}

export function WorkspaceMembers({ workspaceId }: WorkspaceMembersProps) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        setError('');

        const { data, error } = await supabase
          .rpc('get_workspace_members_safe', {
            workspace_id_param: workspaceId
          });

        if (error) throw error;

        setMembers(data || []);
      } catch (err: any) {
        console.error('メンバー取得エラー:', err);
        setError('メンバー情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    if (workspaceId) {
      fetchMembers();
    }
  }, [workspaceId]);

  if (isLoading) {
    return <div className="workspace-members-loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="workspace-members-error">{error}</div>;
  }

  return (
    <div className="workspace-members">
      <h3 className="members-title">ワークスペースメンバー</h3>
      <div className="members-list">
        {members.map((member) => (
          <div key={member.id} className="member-item">
            <span className="member-username">{member.username}</span>
            <span className="member-role">
              {member.role === 'owner' ? 'オーナー' : 'メンバー'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}