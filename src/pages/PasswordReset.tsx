// src/components/PasswordReset.tsx - パスワードリセット機能
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormField from '../components/common/FormField'
import { useForm } from '../hooks/useForm'
import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'
import { sanitizeHtml } from '../utils/sanitize'
import { validationRules } from '../utils/validationRules'  // 追加
import { handleAuthError } from '../utils/authErrorHandler'  // 追加
import type { PasswordResetFormData } from '../types/auth'
import './Auth.scss'

////////////////////////////////////////////////////////////////
// パスワードリセット機能
// Supabaseの resetPasswordForEmail を使用してリセットメールを送信
////////////////////////////////////////////////////////////////

export function PasswordReset() {
  const navigate = useNavigate()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

    const resetForm = useForm<PasswordResetFormData>({
    initialValues: {
        email: ''
    },
    validationRules: {
        email: validationRules.email
    }
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

   if (!resetForm.validateAll()) {
      return
    }

    resetForm.setSubmitting(true)

    try {
    // メールアドレスをサニタイズ
    const sanitizedEmail = sanitizeHtml(resetForm.values.email.trim())
    
    const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/password-reset-confirm`
    })

    if (error) {
    console.error('Password reset error:', error)
    setSubmitError(handleAuthError(error))
    } else {
    setIsSubmitted(true)
    }
    } catch (error) {
      logger.error('パスワードリセットエラー:', error);
      setSubmitError('予期しないエラーが発生しました。');
    } finally {
      resetForm.setSubmitting(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  if (isSubmitted) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1 className="logo">どうする中学受験？</h1>
          <p className="subtitle">メールを送信しました</p>
          <p className="introduction">
            {resetForm.values.email} にパスワードリセット用のリンクを送信しました。<br />
            メールをご確認ください。
          </p>

          <div className="auth-form">
            <button 
              type="button"
              onClick={handleBackToLogin}
              className="btn-secondary"
            >
              ログイン画面に戻る
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
        <p className="subtitle">パスワードリセット</p>
        <p className="introduction">パスワードリセット用のメールをお送りします</p>

        {submitError && <div className="error-message">{submitError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <FormField
              type="email"
              label="メールアドレス"
              placeholder="メールアドレスを入力"
              disabled={resetForm.isSubmitting}
              {...resetForm.getFieldProps('email')}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={resetForm.isSubmitting}
          >
            {resetForm.isSubmitting ? 'メール送信中...' : 'リセットメールを送信'}
          </button>

          <button 
            type="button"
            onClick={handleBackToLogin}
            className="btn-secondary"
          >
            ログイン画面に戻る
          </button>
        </form>
      </div>
    </div>
  )
}