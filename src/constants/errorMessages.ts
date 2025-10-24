// src/constants/errorMessages.ts
// エラーメッセージを一元管理

// 認証関連のエラーメッセージ
export const AUTH_ERROR_MESSAGES = {
  // メールアドレス
  EMAIL_REQUIRED: 'メールアドレスは必須です',
  EMAIL_INVALID: '正しいメールアドレスを入力してください',
  EMAIL_NOT_CONFIRMED: 'このメールアドレスは確認されていません。新規登録時の確認メールをご確認ください。',
  
  // パスワード
  PASSWORD_REQUIRED: 'パスワードは必須です',
  PASSWORD_TOO_SHORT: 'パスワードは8文字以上で入力してください',
  PASSWORD_MISMATCH: 'パスワードが一致しません',
  CONFIRM_PASSWORD_REQUIRED: 'パスワードの確認は必須です',
  
  // ユーザー名
  USERNAME_REQUIRED: 'ユーザー名は必須です',
  USERNAME_TOO_SHORT: 'ユーザー名は2文字以上で入力してください',
  USERNAME_TOO_LONG: 'ユーザー名は20文字以下で入力してください',
  
  // 認証エラー
  INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが間違っています',
  USER_ALREADY_EXISTS: 'このメールアドレスは既に使用されています。',
  RESET_LINK_INVALID: '無効なリセットリンクです。再度パスワードリセットを行ってください。',
  RESET_EMAIL_FAILED: 'メール送信に失敗しました。メールアドレスをご確認ください。',
  PASSWORD_UPDATE_FAILED: 'パスワードの更新に失敗しました。再度お試しください。',
  
  // 一般エラー
  UNEXPECTED_ERROR: '予期しないエラーが発生しました。'
} as const;

// データベースエラーメッセージ
export const DB_ERROR_MESSAGES = {
  FETCH_FAILED: 'データの取得に失敗しました',
  CREATE_FAILED: 'データの作成に失敗しました',
  UPDATE_FAILED: 'データの更新に失敗しました',
  DELETE_FAILED: 'データの削除に失敗しました',
  NOT_FOUND: 'データが見つかりません',
  DUPLICATE: '既に登録されています',
  CONSTRAINT_VIOLATION: '入力内容が正しくありません',
} as const;

// ワークスペースエラーメッセージ
export const WORKSPACE_ERROR_MESSAGES = {
  CREATE_FAILED: 'ワークスペースの作成に失敗しました',
  FETCH_FAILED: 'ワークスペース情報の取得に失敗しました',
  DUPLICATE_NAME: '同じ名前のワークスペースが既に存在します',
  INVALID_NAME: 'ワークスペース名が無効です',
} as const;

// 学校情報エラーメッセージ
export const SCHOOL_ERROR_MESSAGES = {
  FETCH_FAILED: '学校情報の取得に失敗しました',
  SAVE_FAILED: '学校情報の保存に失敗しました',
  DELETE_FAILED: '学校情報の削除に失敗しました',
  NOT_FOUND: '学校が見つかりません',
} as const;

// 受験情報エラーメッセージ
export const EXAM_ERROR_MESSAGES = {
  FETCH_FAILED: '受験情報の取得に失敗しました',
  SAVE_FAILED: '受験情報の保存に失敗しました',
  DELETE_FAILED: '受験情報の削除に失敗しました',
  NOT_FOUND: '受験情報が見つかりません',
} as const;

// 志望校情報エラーメッセージ
export const TARGET_ERROR_MESSAGES = {
  FETCH_FAILED: '志望校情報の取得に失敗しました',
  SAVE_FAILED: '志望校情報の保存に失敗しました',
  DELETE_FAILED: '志望校情報の削除に失敗しました',
  NOT_FOUND: '志望校情報が見つかりません',
} as const;

// 一般エラーメッセージ
export const GENERAL_ERROR_MESSAGES = {
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  UNEXPECTED_ERROR: '予期しないエラーが発生しました',
  LOGIN_REQUIRED: 'ログインが必要です',
  PERMISSION_DENIED: '権限がありません',
} as const;