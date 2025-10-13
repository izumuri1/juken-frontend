// src/components/PasswordResetConfirm.tsx - パスワード更新画面
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FormField from './common/FormField'
import { useForm } from '../hooks/useForm'
import { PasswordUpdateFormData } from '../types/auth'
import './Auth.scss'

////////////////////////////////////////////////////////////////
// パスワードリセット確認・新パスワード設定機能
// メールリンクからアクセスされ、新しいパスワードを設定する
////////////////////////////////////////////////////////////////

export function PasswordResetConfirm() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)

  const passwordForm = useForm<PasswordUpdateFormData>({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationRules: {
      password: {
        custom: (value) => {
          if (!value.trim()) return 'パスワードは必須です'
          if (value.length < 8) return 'パスワードは8文字以上で入力してください'
          return undefined
        }
      },
      confirmPassword: {
        custom: (value) => {
          if (!value.trim()) return 'パスワード確認は必須です'
          if (value !== passwordForm.values.password) return 'パスワードが一致しません'
          return undefined
        }
      }
    }
  })

    useEffect(() => {
            // パスワードリセット用のセッション処理
            const handlePasswordReset = async () => {
            const hash = window.location.hash.substring(1)
            
            if (hash) {
                try {
                // URLハッシュから直接トークンを取得してセッション設定
                if (hash.includes('access_token')) {
                    // 古い形式の処理
                    const params = new URLSearchParams(hash)
                    const accessToken = params.get('access_token')
                    const refreshToken = params.get('refresh_token')
                    
                    if (accessToken && refreshToken) {
                    await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    })
                    }
                } else {
                // 新しい形式：ハッシュがトークンそのもの
                const { error } = await supabase.auth.verifyOtp({
                  token_hash: hash,
                  type: 'recovery'
                })
                
                if (error) {
                  console.error('トークン検証エラー:', error)
                  setSubmitError('無効なリセットリンクです。再度パスワードリセットを行ってください。')
                } else {
                  console.log('パスワードリセットトークンが検証されました')
                }
                }
                } catch (error) {
                console.error('パスワードリセット処理エラー:', error)
                setSubmitError('パスワードリセット処理中にエラーが発生しました。')
                }
            } else {
                setSubmitError('無効なリセットリンクです。再度パスワードリセットを行ってください。')
            }
            }
            
            handlePasswordReset()
        }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (!passwordForm.validateAll()) {
      return
    }

    passwordForm.setSubmitting(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.values.password
      })

      if (error) {
        setSubmitError('パスワードの更新に失敗しました。再度お試しください。')
      } else {
        setIsCompleted(true)
      }
    } catch (error) {
      console.error('パスワード更新エラー:', error)
      setSubmitError('予期しないエラーが発生しました。')
    } finally {
      passwordForm.setSubmitting(false)
    }
  }

  const handleLoginClick = () => {
    navigate('/login')
  }

  if (isCompleted) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1 className="logo">どうする中学受験？</h1>
          <p className="subtitle">パスワードを更新しました</p>
          <p className="introduction">
            新しいパスワードでログインしてください。
          </p>

          <div className="auth-form">
            <button 
              type="button"
              onClick={handleLoginClick}
              className="btn-primary"
            >
              ログイン画面へ
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="logo">どうする中学受験？</h1>
        <p className="subtitle">新しいパスワードを設定</p>
        <p className="introduction">新しいパスワードを入力してください</p>

        {submitError && <div className="error-message">{submitError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <FormField
              type="password"
              label="新しいパスワード"
              placeholder="新しいパスワードを入力"
              disabled={passwordForm.isSubmitting}
              {...passwordForm.getFieldProps('password')}
            />
          </div>

          <div className="form-group">
            <FormField
              type="password"
              label="パスワード確認"
              placeholder="パスワードをもう一度入力"
              disabled={passwordForm.isSubmitting}
              {...passwordForm.getFieldProps('confirmPassword')}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={passwordForm.isSubmitting}
          >
            {passwordForm.isSubmitting ? 'パスワード更新中...' : 'パスワードを更新'}
          </button>

          <button 
            type="button"
            onClick={handleLoginClick}
            className="btn-secondary"
          >
            ログイン画面に戻る
          </button>
        </form>
      </div>
    </div>
  )
}