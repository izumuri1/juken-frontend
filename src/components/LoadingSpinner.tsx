// src/components/LoadingSpinner.tsx
import './LoadingSpinner.scss'

interface LoadingSpinnerProps {
  size?: 'large' | 'small'
  text?: string
  inline?: boolean
}

export function LoadingSpinner({ 
  size = 'large', 
  text = '読み込み中...',
  inline = false 
}: LoadingSpinnerProps) {
  // インラインモード（ボタン内埋め込み用）
  if (inline) {
    return <span className="loading-spinner-inline"></span>
  }

  // 通常モード（画面全体のローディング表示用）
  return (
    <div className="loading-container">
      <div className={`loading-spinner loading-spinner--${size}`}></div>
      <p className="loading-text">{text}</p>
    </div>
  )
}