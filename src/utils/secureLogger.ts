// src/utils/secureLogger.ts
// セキュアなログ出力ユーティリティ

/**
 * 機密情報をマスクする
 */
function maskSensitiveData(data: any): any {
  if (typeof data === 'string') {
    // メールアドレスをマスク
    data = data.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match, user, domain) => {
      const maskedUser = user.length > 2 ? user.slice(0, 2) + '***' : '***';
      return `${maskedUser}@${domain}`;
    });
    
    // トークンやキーをマスク
    if (data.includes('token') || data.includes('key') || data.includes('password')) {
      return '[REDACTED]';
    }
  }
  
  if (typeof data === 'object' && data !== null) {
    const masked: any = Array.isArray(data) ? [] : {};
    
    for (const key in data) {
      // 機密情報のキーをチェック
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
      const isSensitive = sensitiveKeys.some(k => key.toLowerCase().includes(k));
      
      if (isSensitive) {
        masked[key] = '[REDACTED]';
      } else {
        masked[key] = maskSensitiveData(data[key]);
      }
    }
    
    return masked;
  }
  
  return data;
}

/**
 * セキュアなロガー
 */
export const secureLogger = {
  /**
   * 本番環境かどうか
   */
  isProduction: import.meta.env.PROD,

  /**
   * ログレベル
   */
  log(...args: any[]) {
    if (!this.isProduction) {
      console.log(...args.map(maskSensitiveData));
    }
  },

  /**
   * エラーログ（本番環境でも出力）
   */
  error(...args: any[]) {
    console.error(...args.map(maskSensitiveData));
  },

  /**
   * 警告ログ
   */
  warn(...args: any[]) {
    if (!this.isProduction) {
      console.warn(...args.map(maskSensitiveData));
    }
  },

  /**
   * デバッグログ（開発環境のみ）
   */
  debug(...args: any[]) {
    if (!this.isProduction && import.meta.env.DEV) {
      console.debug(...args.map(maskSensitiveData));
    }
  },
};