// 帯色
export type BeltColor = 'white' | 'blue' | 'purple' | 'brown' | 'black';

// ユーザー
export interface User {
  id: string;
  display_name: string;
  avatar_url?: string;
  belt_color: BeltColor;
  belt_stripes: number;
  bjj_start_date?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

// カテゴリ
export interface Category {
  id: string;
  user_id?: string;
  name: string;
  parent_id?: string;
  sort_order: number;
  is_preset: boolean;
  created_at: string;
}

// 技の種類
export type TechniqueType = 'sweep' | 'pass' | 'submission' | 'escape' | 'takedown' | 'position' | 'other';

// 習得レベル
export type MasteryLevel = 'learning' | 'learned' | 'favorite';

// 技
export interface Technique {
  id: string;
  user_id: string;
  name: string;
  name_en?: string;
  category_id?: string;
  category?: string; // カテゴリID（ローカル用）
  technique_type: TechniqueType;
  description?: string;
  video_url?: string;
  video_type: 'youtube' | 'uploaded';
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  mastery_level: MasteryLevel;
  created_at: string;
  updated_at: string;
}

// フロー
export interface Flow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// フローノード
export interface FlowNode {
  id: string;
  flow_id: string;
  technique_id?: string;
  label?: string;
  node_type: 'technique' | 'condition' | 'note';
  position_x: number;
  position_y: number;
  style?: Record<string, any>;
  created_at: string;
  technique?: Technique;
}

// フローエッジ
export interface FlowEdge {
  id: string;
  flow_id: string;
  source_node_id: string;
  target_node_id: string;
  label?: string;
  edge_type: 'default' | 'success' | 'counter';
  style?: Record<string, any>;
  created_at: string;
}

// 練習日記
export interface TrainingLog {
  id: string;
  user_id: string;
  training_date: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  content?: string;
  notes?: string;
  condition?: number;
  sparring_rounds?: number;
  created_at: string;
  updated_at: string;
  techniques?: Technique[];
  flows?: Flow[];
}

// グループ
export interface Group {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  invite_code?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// グループメンバー
export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user?: User;
}

// 帯テーマ
export interface BeltTheme {
  name: string;
  maxStripes: number;
  primary: string;
  gradient: string;
  bg: string;
  card: string;
  cardBorder: string;
  accent: string;
}

// 帯テーマ定義
export const beltThemes: Record<BeltColor, BeltTheme> = {
  white: {
    name: '白帯',
    maxStripes: 4,
    primary: '#64748b',
    gradient: 'linear-gradient(135deg, #475569 0%, #64748b 50%, #94a3b8 100%)',
    bg: '#0f172a',
    card: 'rgba(100, 116, 139, 0.1)',
    cardBorder: 'rgba(100, 116, 139, 0.2)',
    accent: '#e2e8f0',
  },
  blue: {
    name: '青帯',
    maxStripes: 4,
    primary: '#3b82f6',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
    bg: '#030712',
    card: 'rgba(59, 130, 246, 0.08)',
    cardBorder: 'rgba(59, 130, 246, 0.15)',
    accent: '#60a5fa',
  },
  purple: {
    name: '紫帯',
    maxStripes: 4,
    primary: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #8b5cf6 100%)',
    bg: '#0a0118',
    card: 'rgba(139, 92, 246, 0.08)',
    cardBorder: 'rgba(139, 92, 246, 0.15)',
    accent: '#a78bfa',
  },
  brown: {
    name: '茶帯',
    maxStripes: 4,
    primary: '#b45309',
    gradient: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)',
    bg: '#0c0a09',
    card: 'rgba(180, 83, 9, 0.08)',
    cardBorder: 'rgba(180, 83, 9, 0.15)',
    accent: '#fbbf24',
  },
  black: {
    name: '黒帯',
    maxStripes: 6,
    primary: '#dc2626',
    gradient: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)',
    bg: '#09090b',
    card: 'rgba(255, 255, 255, 0.05)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    accent: '#ef4444',
  },
};
