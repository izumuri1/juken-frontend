// src/constants/appConstants.ts
// アプリケーション全体で使用する定数を一元管理

/**
 * バリデーション関連の定数
 */
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
  },
  USERNAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
  },
  WORKSPACE_NAME: {
    MAX_LENGTH: 30,
  },
  EMAIL: {
    MAX_LENGTH: 255,
  },
} as const;

/**
 * 検索関連の定数
 */
export const SEARCH = {
  QUERY: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
} as const;

/**
 * 招待トークン関連の定数
 */
export const INVITATION = {
  TOKEN: {
    EXPIRY_HOURS: 24,
    MAX_USES: 1,
  },
} as const;

/**
 * 日付・時刻フォーマット関連の定数
 */
export const DATE_FORMAT = {
  LOCALE: 'ja-JP' as const,
  OPTIONS: {
    DATE: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    } as const,
    TIME: {
      hour: '2-digit',
      minute: '2-digit',
    } as const,
    DATE_TIME: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    } as const,
  },
} as const;

/**
 * 許可される文字パターン（正規表現）
 */
export const ALLOWED_PATTERNS = {
  // 日本語（ひらがな、カタカナ、漢字）、英数字、スペース、ハイフン、長音記号
  SEARCH: /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBFa-zA-Z0-9\s\-ー]+$/,
  // ワークスペース名用（半角英数字、ひらがな、カタカナ、漢字、スペース、ハイフン、アンダースコア）
  WORKSPACE_NAME: /^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s\-_]+$/,
} as const;