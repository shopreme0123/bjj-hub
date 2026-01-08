// カテゴリ型
export interface TechniqueCategory {
  id: string;
  name: string;
  icon: string;
}

// デフォルトカテゴリ
export const defaultCategories: TechniqueCategory[] = [
  { id: 'guard', name: 'ガード（ボトム）', icon: '🛡️' },
  { id: 'top', name: 'トップポジション', icon: '⬆️' },
  { id: 'stand', name: 'スタンド', icon: '🧍' },
  { id: 'leglock', name: 'レッグロック', icon: '🦵' },
  { id: 'turtle', name: 'タートル', icon: '🐢' },
  { id: 'back', name: 'バック', icon: '🔙' },
];

// アイコン選択用のオプション
export const emojiOptions = ['🥋', '💪', '🦶', '✋', '🔄', '⚔️', '🎯', '🏆', '⭐', '🔥', '💎', '🌟'];
