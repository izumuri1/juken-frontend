// src/utils/sessionManager.ts
// セッション管理ユーティリティ

import { supabase } from '../lib/supabase';

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1時間（ミリ秒）
const ACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000; // 5分ごとにチェック

class SessionManager {
  private lastActivityTime: number = Date.now();
  private activityCheckInterval: number | null = null;

  /**
   * セッション管理を開始
   */
  startMonitoring() {
    // 既存の監視をクリア
    this.stopMonitoring();

    // ユーザーアクティビティをトラッキング
    this.trackUserActivity();

    // 定期的にセッションをチェック
    this.activityCheckInterval = setInterval(() => {
      this.checkSessionTimeout();
    }, ACTIVITY_CHECK_INTERVAL);
  }

  /**
   * セッション管理を停止
   */
  stopMonitoring() {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }
  }

  /**
   * ユーザーアクティビティをトラッキング
   */
  private trackUserActivity() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.lastActivityTime = Date.now();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
  }

  /**
   * セッションタイムアウトをチェック
   */
  private async checkSessionTimeout() {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivityTime;

    // セッションタイムアウトを超えている場合
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      await this.handleSessionTimeout();
    }
  }

  /**
   * セッションタイムアウト時の処理
   */
  private async handleSessionTimeout() {
    try {
      // セッションをクリア
      await supabase.auth.signOut();
      
      // ローカルストレージをクリア
      localStorage.clear();
      sessionStorage.clear();
      
      // ログイン画面にリダイレクト
      window.location.href = '/login?timeout=true';
    } catch (error) {
      console.error('セッションタイムアウト処理エラー:', error);
    }
  }

  /**
   * 手動でセッションをリフレッシュ
   */
  async refreshSession() {
    try {
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('セッションリフレッシュエラー:', error);
        await this.handleSessionTimeout();
        return false;
      }
      
      this.lastActivityTime = Date.now();
      return true;
    } catch (error) {
      console.error('セッションリフレッシュ例外:', error);
      return false;
    }
  }
}

// シングルトンインスタンス
export const sessionManager = new SessionManager();