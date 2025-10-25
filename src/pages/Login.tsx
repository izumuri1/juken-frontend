// src/components/Login.tsx
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import FormField from '../components/common/FormField'
import { useForm } from '../hooks/useForm'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { supabase } from '../lib/supabase'
import { rateLimiter } from '../utils/rateLimiter'  // ← 追加
import type { LoginFormData } from '../types/auth'
import './Auth.scss'

// ログインフォームの型定義
export function Login() {
  const { signIn, loading } = useAuth()
  const appv_navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [appv_submitError, appf_setSubmitError] = useState('')
  const [_inviteToken, setInviteToken] = useState<string | null>(null)

  // URLパラメータから招待トークンを取得
  useEffect(() => {
    const token = searchParams.get('inviteToken')
    if (token) {
      setInviteToken(token)
      // sessionStorageに保存（ログイン後に使用）
      sessionStorage.setItem('pendingInviteToken', token)
    }
  }, [searchParams])

  // フォーム管理
  const appv_loginForm = useForm<LoginFormData>({
    initialValues: {
      email: '',
      password: ''
    },
    validationRules: {
      email: {
        custom: (value) => {
          if (!value.trim()) return 'メールアドレスは必須です'
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '正しいメールアドレスを入力してください'
          return undefined
        }
      },
      password: {
        custom: (value) => {
          if (!value.trim()) return 'パスワードは必須です'
          return undefined
        }
      }
    }
  })

// ログイン処理
  const appf_handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!appv_loginForm.validateAll()) {
    return
  }

  appf_setSubmitError('')
  
  // ← ここから追加
  // レート制限チェック
  const trimmedEmail = appv_loginForm.values.email.trim()
  const rateLimitCheck = rateLimiter.checkAttempt(trimmedEmail)
  
  if (!rateLimitCheck.allowed) {
    const blockedMinutes = rateLimitCheck.blockedUntil 
      ? Math.ceil((rateLimitCheck.blockedUntil.getTime() - Date.now()) / 60000)
      : 30
    appf_setSubmitError(
      `ログイン試行回数が上限に達しました。${blockedMinutes}分後に再度お試しください。`
    )
    return
  }
  // ← ここまで追加

  appv_loginForm.setSubmitting(true)

  try {
      const { error } = await signIn(trimmedEmail, appv_loginForm.values.password)

      if (error) {
        // エラー処理（セキュリティを考慮したエラーメッセージ）
        switch (error.code) {
          case 'invalid_credentials':
          case 'user_not_found':  // ユーザーの存在を明示しない
            appf_setSubmitError('メールアドレスまたはパスワードが正しくありません。')
            break
          case 'email_not_confirmed':
            appf_setSubmitError('メールアドレスの確認が完了していません。')
            break
          default:
            // 詳細なエラー情報を表示しない
            appf_setSubmitError('ログインできませんでした。入力内容をご確認ください。')
        }
      } else {
        // ログイン成功時に試行回数をリセット
        rateLimiter.resetAttempts(trimmedEmail)
        
        // ログイン成功
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        
        if (currentUser) {
          // 招待トークンがある場合は招待リンクに戻る
          const pendingToken = sessionStorage.getItem('pendingInviteToken')
          if (pendingToken) {
            sessionStorage.removeItem('pendingInviteToken')
            appv_navigate(`/invite/${pendingToken}`)
            return
          }

          // 通常のログイン処理
          const { data: ownerWorkspaces } = await supabase
            .from("workspaces")
            .select("id")
            .eq("owner_id", currentUser.id)
          
          const { data: memberWorkspaces } = await supabase
            .from("workspace_members")
            .select("workspace_id")
            .eq("user_id", currentUser.id)
          
          const allWorkspaceIds = new Set([
            ...(ownerWorkspaces || []).map(w => w.id),
            ...(memberWorkspaces || []).map(m => m.workspace_id)
          ])
          
          if (allWorkspaceIds.size === 0) {
            appv_navigate('/workspaces')
          } else if (allWorkspaceIds.size === 1) {
            const workspaceId = Array.from(allWorkspaceIds)[0]
            appv_navigate(`/workspace/${workspaceId}`)
          } else {
            appv_navigate('/workspaces')
          }
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      appf_setSubmitError('ログインに失敗しました。')
    } finally {
      appv_loginForm.setSubmitting(false)
    }
  }

  const appf_handleSignUpClick = () => {
    appv_navigate('/signup')
  }

  const appf_handlePasswordResetClick = () => {
    appv_navigate('/password-reset')
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="logo">どうする中学受験？</h1>
        <p className="subtitle">おかえりなさい</p>
        <p className="introduction">アカウントにログインして始めましょう</p>

        {appv_submitError && <div className="error-message">{appv_submitError}</div>}

        <form onSubmit={appf_handleSubmit} className="auth-form">
          <div className="form-group">
            <FormField
              type="email"
              label="メールアドレス"
              placeholder="メールアドレスを入力"
              disabled={loading || appv_loginForm.isSubmitting}
              {...appv_loginForm.getFieldProps('email')}
            />
          </div>

          <div className="form-group">
            <FormField
              type="password"
              label="パスワード"
              placeholder="パスワードを入力"
              disabled={loading || appv_loginForm.isSubmitting}
              {...appv_loginForm.getFieldProps('password')}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || appv_loginForm.isSubmitting}
          >
            {loading || appv_loginForm.isSubmitting ? (
              <>
                <LoadingSpinner inline />
                ログイン中...
              </>
            ) : 'ログイン'}
          </button>

          <p className="auth-switch">
            アカウントをお持ちでない方は
            <button
              type="button"
              onClick={appf_handleSignUpClick}
              className="link-button"
            >
              新規アカウント登録
            </button>
          </p>

          <p className="auth-switch">
            <button
              type="button"
              onClick={appf_handlePasswordResetClick}
              className="link-button"
            >
              パスワードを忘れた方はこちら
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}