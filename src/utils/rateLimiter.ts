// src/utils/rateLimiter.ts
// レート制限ユーティリティ

interface RateLimitEntry {
  attempts: number;
  firstAttemptTime: number;
  blockedUntil?: number;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private readonly MAX_ATTEMPTS = 5;
  private readonly TIME_WINDOW = 15 * 60 * 1000; // 15分
  private readonly BLOCK_DURATION = 30 * 60 * 1000; // 30分

  /**
   * ログイン試行をチェック
   * @param identifier - メールアドレスまたはIPアドレス
   * @returns 試行可能かどうか
   */
  checkAttempt(identifier: string): { allowed: boolean; remainingAttempts?: number; blockedUntil?: Date } {
    const now = Date.now();
    const entry = this.storage.get(identifier);

    // エントリーが存在しない場合は初回試行
    if (!entry) {
      this.storage.set(identifier, {
        attempts: 1,
        firstAttemptTime: now,
      });
      return { allowed: true, remainingAttempts: this.MAX_ATTEMPTS - 1 };
    }

    // ブロック期間中かチェック
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        blockedUntil: new Date(entry.blockedUntil),
      };
    }

    // 時間ウィンドウを過ぎている場合はリセット
    if (now - entry.firstAttemptTime > this.TIME_WINDOW) {
      this.storage.set(identifier, {
        attempts: 1,
        firstAttemptTime: now,
      });
      return { allowed: true, remainingAttempts: this.MAX_ATTEMPTS - 1 };
    }

    // 試行回数をインクリメント
    entry.attempts += 1;

    // 最大試行回数を超えた場合はブロック
    if (entry.attempts > this.MAX_ATTEMPTS) {
      entry.blockedUntil = now + this.BLOCK_DURATION;
      this.storage.set(identifier, entry);
      return {
        allowed: false,
        blockedUntil: new Date(entry.blockedUntil),
      };
    }

    this.storage.set(identifier, entry);
    return {
      allowed: true,
      remainingAttempts: this.MAX_ATTEMPTS - entry.attempts,
    };
  }

  /**
   * ログイン成功時に試行回数をリセット
   * @param identifier - メールアドレスまたはIPアドレス
   */
  resetAttempts(identifier: string): void {
    this.storage.delete(identifier);
  }

  /**
   * 古いエントリーをクリーンアップ（メモリ管理）
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      // ブロック期間も時間ウィンドウも過ぎているエントリーを削除
      const shouldDelete =
        (!entry.blockedUntil || now > entry.blockedUntil) &&
        now - entry.firstAttemptTime > this.TIME_WINDOW;

      if (shouldDelete) {
        this.storage.delete(key);
      }
    }
  }
}

// シングルトンインスタンス
export const rateLimiter = new RateLimiter();

// 定期的にクリーンアップを実行（1時間ごと）
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 60 * 60 * 1000);
}