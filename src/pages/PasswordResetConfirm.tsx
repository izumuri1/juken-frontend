// src/components/PasswordResetConfirm.tsx - パスワード更新画面
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FormField from '../components/common/FormField'
import { useForm } from '../hooks/useForm'
import { validationRules } from '../utils/validationRules'
import type { PasswordUpdateFormData } from '../types/auth'
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
    password: validationRules.password,
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
      // URLハッシュとクエリパラメータの両方をチェック
      const hash = window.location.hash.substring(1)
      const searchParams = new URLSearchParams(window.location.search)
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      
      console.log('=== パスワードリセット初期化 ===')
      console.log('hash:', hash)
      console.log('tokenHash:', tokenHash)
      console.log('type:', type)
      
      try {
          // クエリパラメータ形式（ConfirmationURL使用時）
          if (tokenHash && type === 'recovery') {
          console.log('クエリパラメータ形式で処理します')
          const { error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'recovery'
          })
          
          if (error) {
              console.error('トークン検証エラー:', error)
              setSubmitError('無効なリセットリンクです。再度パスワードリセットを行ってください。')
          } else {
              console.log('パスワードリセットトークンが検証されました')
          }
          }
          // URLハッシュ形式（従来の形式）
          else if (hash) {
          console.log('URLハッシュ形式で処理します')
          
          if (hash.includes('access_token')) {
              // 古い形式: access_token + refresh_token
              const params = new URLSearchParams(hash)
              const accessToken = params.get('access_token')
              const refreshToken = params.get('refresh_token')
              
              if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken
              })
              console.log('セッション設定完了')
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
          } else {
          console.error('トークンが見つかりません')
          setSubmitError('無効なリセットリンクです。再度パスワードリセットを行ってください。')
          }
      } catch (error) {
          console.error('パスワードリセット処理エラー:', error)
          setSubmitError('パスワードリセット処理中にエラーが発生しました。')
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
      // 現在のユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setSubmitError('セッションが無効です。再度パスワードリセットを行ってください。')
        return
      }

      // パスワードを更新
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.values.password
      })

      if (error) {
        console.error('パスワード更新エラー:', error)
        setSubmitError('パスワードの更新に失敗しました。再度お試しください。')
      } else {
        // パスワード更新成功
        // ローカルストレージとセッションストレージをクリア
        localStorage.clear()
        sessionStorage.clear()
        
        // すべてのセッションをサインアウト
        await supabase.auth.signOut({ scope: 'global' })
        
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