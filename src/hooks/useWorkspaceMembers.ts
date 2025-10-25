// src/hooks/useWorkspaceMembers.ts
// ワークスペースのメンバー一覧を取得するフック

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { secureLogger } from '../utils/secureLogger'
import { WORKSPACE_ERROR_MESSAGES } from '../constants/errorMessages'

interface WorkspaceMember {
  id: string
  user_id: string
  username: string
  role: 'owner' | 'member'
  joined_at: string
}

interface UseWorkspaceMembersReturn {
  members: WorkspaceMember[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * ワークスペースのメンバー一覧を取得するフック
 * 
 * @example
 * const { members, loading, error, refetch } = useWorkspaceMembers(workspaceId)
 * 
 * // メンバーの表示
 * {members.map(member => (
 *   <div key={member.id}>
 *     {member.username} ({member.role === 'owner' ? 'オーナー' : 'メンバー'})
 *   </div>
 * ))}
 */
export function useWorkspaceMembers(
  workspaceId: string | undefined
): UseWorkspaceMembersReturn {
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = async () => {
    if (!workspaceId) {
      secureLogger.log('workspaceIdが未設定のためメンバー取得をスキップ')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // RPCを使用してメンバー情報を取得
      const { data, error: rpcError } = await supabase
        .rpc('get_workspace_members_safe', {
          workspace_id_param: workspaceId
        })

      if (rpcError) {
        secureLogger.error('メンバー取得RPC呼び出しエラー:', rpcError)
        throw rpcError
      }

      setMembers(data || [])
      secureLogger.log('メンバー取得成功:', data)
    } catch (err) {
      secureLogger.error('メンバー取得エラー:', err)
      setError(WORKSPACE_ERROR_MESSAGES.FETCH_FAILED)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [workspaceId])

  return {
    members,
    loading,
    error,
    refetch: fetchMembers
  }
}