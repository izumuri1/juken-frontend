import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './components/Login'
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
        path="/home" 
        element={user ? <div>Home画面（今後実装）</div> : <Navigate to="/login" replace />} 
      />
      {/* 未定義のパスは/にリダイレクト */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App