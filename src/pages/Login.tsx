// src/components/Login.tsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import FormField from '../components/common/FormField'
import { useForm } from '../hooks/useForm'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { supabase } from '../lib/supabase'
import type { LoginFormData } from '../types/auth'
import './Auth.scss'

// ログインフォームの型定義
export function Login() {
  const { signIn, loading } = useAuth()
  const appv_navigate = useNavigate()
  const [appv_submitError, appf_setSubmitError] = useState('')

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
  appv_loginForm.setSubmitting(true)

  try {
  const trimmedEmail = appv_loginForm.values.email.trim()
  
  const { error } = await signIn(trimmedEmail, appv_loginForm.values.password)

    if (error) {
      switch (error.code) {
        case 'invalid_credentials':
          appf_setSubmitError('メールアドレスまたはパスワードが正しくありません。')
          break
        case 'email_not_confirmed':
          appf_setSubmitError('メールアドレスの確認が完了していません。確認メールをご確認ください。')
          break
        case 'user_not_found':
          appf_setSubmitError('アカウントが見つかりません。メールアドレスを確認してください。')
          break
        default:
          appf_setSubmitError('ログインに失敗しました。メールアドレスとパスワードを確認してください。')
      }
    } else {
      // ログイン成功 - ワークスペース数を確認して遷移先を決定
      // Note: AuthContextのuserはまだ更新されていない可能性があるため、
      // Supabaseから直接現在のユーザーを取得
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (currentUser) {
        // ユーザーが参加しているワークスペースを取得
        const { data: ownerWorkspaces } = await supabase
          .from("workspaces")
          .select("id")
          .eq("owner_id", currentUser.id)
        
        const { data: memberWorkspaces } = await supabase
          .from("workspace_members")
          .select("workspace_id")
          .eq("user_id", currentUser.id)
        
        // 重複を除いた全ワークスペース数を計算
        const allWorkspaceIds = new Set([
          ...(ownerWorkspaces || []).map(w => w.id),
          ...(memberWorkspaces || []).map(m => m.workspace_id)
        ])
        
        if (allWorkspaceIds.size === 0) {
          // ワークスペースが0個 → ワークスペース作成/選択画面へ
          appv_navigate('/workspaces')
        } else if (allWorkspaceIds.size === 1) {
          // ワークスペースが1個 → そのワークスペースのHome画面へ
          const workspaceId = Array.from(allWorkspaceIds)[0]
          appv_navigate(`/workspace/${workspaceId}`)
        } else {
          // ワークスペースが複数 → ワークスペース選択画面へ
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