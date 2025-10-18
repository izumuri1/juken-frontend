// src/components/EmailConfirmationWaiting.tsx
import { useLocation, useNavigate } from 'react-router-dom'
import './Auth.scss' // 認証画面共通のスタイルを使用

export function EmailConfirmationWaiting() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="logo">どうする中学受験？</h1>
        <p className="subtitle">メールを確認してください</p>
        
        <div className="success-message">
          {email} に確認メールを送信しました。
        </div>

        <p className="introduction">
          メール内のリンクをクリックして、アカウントを有効化してください。
        </p>

        <div className="auth-form">
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            ログイン画面へ
          </button>
        </div>
      </div>
    </div>
  )
}