import { useWorkspaceMembers } from '../hooks/useWorkspaceMembers';

interface WorkspaceMembersProps {
  workspaceId: string;
}

export function WorkspaceMembers({ workspaceId }: WorkspaceMembersProps) {
  const { members, loading, error } = useWorkspaceMembers(workspaceId);

  if (loading) {
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