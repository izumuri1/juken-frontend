import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './components/Login'
import { SignUp } from './components/SignUp'
import { PasswordReset } from './components/PasswordReset'
import { PasswordResetConfirm } from './components/PasswordResetConfirm'
import { useAuth } from './contexts/AuthContext'
import './App.scss'

function App() {
  const { user, loading } = useAuth()

  // 認証状態の確認中は読み込み表示
  if (loading) {
    return <div>Loading...</div>
  }

return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to="/home" replace /> : <Login />} 
      />
      <Route 
        path="/login" 
        element={user ? <Navigate to="/home" replace /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to="/home" replace /> : <SignUp />} 
      />
      <Route 
        path="/password-reset" 
        element={user ? <Navigate to="/home" replace /> : <PasswordReset />} 
      />
      <Route 
        path="/password-reset-confirm" 
        element={<PasswordResetConfirm />} 
      />
      <Route 
        path="/home" 
        element={user ? <div>Home画面（今後実装）</div> : <Navigate to="/login" replace />} 
      />
      {/* 未定義のパスは/にリダイレクト */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App