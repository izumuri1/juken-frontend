// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session, AuthError, AuthChangeEvent } from '@supabase/auth-js'

// Context の型定義
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

// Context作成
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider の Props 型定義
interface AuthProviderProps {
  children: ReactNode
}

// AuthProvider コンポーネント
export function AuthProvider({ children }: AuthProviderProps) {
  // 状態管理（自作変数として appv_ プレフィックス）
  const [appv_user, appf_setUser] = useState<User | null>(null)
  const [appv_session, appf_setSession] = useState<Session | null>(null)
  const [appv_loading, appf_setLoading] = useState(true)

  useEffect(() => {
    // 初期セッション取得
    const appf_getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      appf_setSession(session)
      appf_setUser(session?.user ?? null)
      appf_setLoading(false)
    }

    appf_getSession()

    // 認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        appf_setSession(session)
        appf_setUser(session?.user ?? null)
        appf_setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // サインアップ関数（自作関数として appf_ プレフィックス）
  const appf_signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    })

    // 重複ユーザーチェック
    if (!error && data.user) {
      if (data.user.identities && data.user.identities.length === 0) {
        return {
          error: {
            code: 'user_already_exists',
            message: 'このメールアドレスは既に使用されています。',
            status: 400
          } as AuthError
        }
      }

      if (!data.user.email_confirmed_at && data.user.created_at) {
        const appv_createdTime = new Date(data.user.created_at).getTime()
        const appv_nowTime = Date.now()
        const appv_timeDiff = Math.abs(appv_nowTime - appv_createdTime)

        if (appv_timeDiff > 5000) {
          return {
            error: {
              code: 'user_already_exists',
              message: 'このメールアドレスは既に使用されています。',
              status: 400
            } as AuthError
          }
        }
      }
    }

    return { error }
  }

  // サインイン関数
  const appf_signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  // サインアウト関数
  const appf_signOut = async () => {
    await supabase.auth.signOut()
  }

  // Provider に渡す値
  const appv_value: AuthContextType = {
    user: appv_user,
    session: appv_session,
    loading: appv_loading,
    signUp: appf_signUp,
    signIn: appf_signIn,
    signOut: appf_signOut
  }

  return (
    <AuthContext.Provider value={appv_value}>
      {children}
    </AuthContext.Provider>
  )
}

// useAuth カスタムフック
export function useAuth() {
  const appv_context = useContext(AuthContext)
  if (appv_context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return appv_context
}