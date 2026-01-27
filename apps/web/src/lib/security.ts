/**
 * セキュリティ関連のユーティリティ関数
 */

/**
 * 安全にJSONをパースする
 * パースに失敗した場合はデフォルト値を返す
 */
export function safeJsonParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;

  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
}

/**
 * 暗号学的に安全なランダム文字列を生成
 * @param length 生成する文字列の長さ
 * @param charset 使用する文字セット
 */
export function generateSecureCode(
  length: number = 6,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
): string {
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[array[i] % charset.length];
  }
  return result;
}

/**
 * パスワード強度をチェック
 * @returns エラーメッセージ（問題なければnull）
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // 最小長チェック
  if (password.length < 8) {
    errors.push('8文字以上必要です');
  }

  // 最大長チェック
  if (password.length > 128) {
    errors.push('128文字以内にしてください');
  }

  // 英字チェック
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('英字を含めてください');
  }

  // 数字チェック
  if (!/[0-9]/.test(password)) {
    errors.push('数字を含めてください');
  }

  // 強度判定
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;

  const strengthPoints = [hasUppercase, hasLowercase, hasNumber, hasSpecial, isLongEnough]
    .filter(Boolean).length;

  if (strengthPoints >= 4 && password.length >= 12) {
    strength = 'strong';
  } else if (strengthPoints >= 3 && password.length >= 8) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * 入力値のサニタイズ（XSS対策）
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // HTMLタグを削除
    .slice(0, 10000); // 最大長制限
}

/**
 * 表示名のバリデーション
 */
export function validateDisplayName(name: string): { isValid: boolean; error?: string } {
  const trimmed = name.trim();

  if (trimmed.length < 1) {
    return { isValid: false, error: '表示名を入力してください' };
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: '表示名は50文字以内にしてください' };
  }

  return { isValid: true };
}

/**
 * メールアドレスのバリデーション
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: '有効なメールアドレスを入力してください' };
  }

  if (trimmed.length > 254) {
    return { isValid: false, error: 'メールアドレスが長すぎます' };
  }

  return { isValid: true };
}
