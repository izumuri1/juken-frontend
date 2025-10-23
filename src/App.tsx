// src/App.tsx
// 変更箇所: Examページのルートを追加

import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { SignUp } from './pages/SignUp'
import { InviteHandler } from './components/InviteHandler';
import { PasswordReset } from './pages/PasswordReset'
import { PasswordResetConfirm } from './pages/PasswordResetConfirm'
import { EmailConfirmationWaiting } from './pages/EmailConfirmationWaiting'
import { CreateWorkspace } from './pages/CreateWorkspace'
import Home from './pages/Home'
import School from './pages/School'
import Target from './pages/Target'
import Exam from './pages/Exam'
import Comparison1 from './pages/Comparison1'
import Comparison2 from './pages/Comparison2'
import { useAuth } from './contexts/AuthContext'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to="/workspaces" replace /> : <Login />} 
      />
      <Route 
        path="/login" 
        element={user ? <Navigate to="/workspaces" replace /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to="/home" replace /> : <SignUp />} 
      />
      <Route 
        path="/invite/:token" 
        element={<InviteHandler />} 
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
        path="/email-confirmation-waiting" 
        element={<EmailConfirmationWaiting />} 
      />
      <Route 
        path="/workspaces" 
        element={user ? <CreateWorkspace /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/workspace/:workspaceId" 
        element={user ? <Home /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/workspace/:workspaceId/school/:schoolCode" 
        element={user ? <School /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/workspace/:workspaceId/target/:schoolCode" 
        element={user ? <Target /> : <Navigate to="/login" replace />} 
      />
       {/* ← Examページのルートを追加 */}
      <Route 
        path="/workspace/:workspaceId/school/:schoolId/exam" 
        element={user ? <Exam /> : <Navigate to="/login" replace />} 
      />
      {/* ← Comparison1ページのルートを追加 */}
      <Route 
        path="/workspace/:workspaceId/comparison1" 
        element={user ? <Comparison1 /> : <Navigate to="/login" replace />} 
      />
      {/* ← Comparison2ページのルートを追加 */}
      <Route 
        path="/workspace/:workspaceId/comparison2" 
        element={user ? <Comparison2 /> : <Navigate to="/login" replace />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App