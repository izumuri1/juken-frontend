// src/types/workspace.ts
// ワークスペース関連の型定義

// ワークスペース
export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

// ワークスペースメンバー
export interface WorkspaceMember {
  id: string;
  name: string;
  role: 'owner' | 'member';
}

// ワークスペース作成フォーム
export interface CreateWorkspaceFormData {
  workspaceName: string;
}