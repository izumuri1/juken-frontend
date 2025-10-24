// src/components/ErrorBoundary.tsx
// アプリケーション全体のエラーをキャッチするError Boundaryコンポーネント

import React, { Component } from 'react'
import type { ReactNode } from 'react'
import { logger } from '../utils/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary コンポーネント
 * 子コンポーネントで発生したエラーをキャッチして表示する
 * 
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // エラーが発生したらstateを更新
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // エラーをログに記録
    logger.error('Error Boundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    // エラー状態をリセット
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // カスタムfallbackが提供されていればそれを表示
      if (this.props.fallback) {
        return this.props.fallback
      }

      // デフォルトのエラー表示
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
          fontFamily: 'sans-serif'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>
            エラーが発生しました
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            申し訳ございません。予期しないエラーが発生しました。
            <br />
            ページを再読み込みするか、しばらく時間をおいてから再度お試しください。
          </p>
          {this.state.error && (
            <details style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                エラー詳細
              </summary>
              <pre style={{
                marginTop: '12px',
                fontSize: '12px',
                overflow: 'auto',
                color: '#dc2626'
              }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ページを再読み込み
            </button>
            <button
              onClick={this.handleReset}
              style={{
                padding: '12px 24px',
                backgroundColor: '#fff',
                color: '#000',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              リトライ
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}