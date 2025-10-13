// src/constants/errorMessages.ts
// 認証関連のエラーメッセージを一元管理

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
} as const