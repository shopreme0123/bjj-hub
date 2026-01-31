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

// 技（iOS版Techniqueに準拠）
export interface Technique {
  id: string;
  user_id: string;
  name: string;
  name_en?: string;
  category_id?: string;
  category?: string; // カテゴリID（ローカル用）
  technique_type: TechniqueType;
  description?: string;
  video_url?: string; // YouTube URL
  video_type: 'youtube' | 'uploaded';
  video_urls?: string[]; // ローカル動画URL（複数対応）iOS版に準拠
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
  flow_data?: Record<string, any>; // ノードとエッジのデータ
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

// ビデオ情報（iOS版に準拠）
export interface VideoInfo {
  id: string;
  url: string; // ローカルBlob URLまたはアップロードURL
  title?: string;
  thumbnail?: string;
  duration?: number; // 秒
}

// 練習日記（iOS版TrainingLogに準拠）
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
  video_urls?: string[]; // 動画URL（最大10件）iOS版に準拠
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
  text: string;
  textSecondary: string;
  textMuted: string;
}

// 帯テーマ定義（ライトテーマ）
export const beltThemes: Record<BeltColor, BeltTheme> = {
  white: {
    name: 'belt.white',
    maxStripes: 4,
    primary: '#64748b',
    gradient: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
    bg: '#f8fafc',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    accent: '#475569',
    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
  },
  blue: {
    name: 'belt.blue',
    maxStripes: 4,
    primary: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    bg: '#f8fafc',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    accent: '#2563eb',
    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
  },
  purple: {
    name: 'belt.purple',
    maxStripes: 4,
    primary: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    bg: '#f8fafc',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    accent: '#7c3aed',
    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
  },
  brown: {
    name: 'belt.brown',
    maxStripes: 4,
    primary: '#b45309',
    gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
    bg: '#f8fafc',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    accent: '#92400e',
    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
  },
  black: {
    name: 'belt.black',
    maxStripes: 6,
    primary: '#18181b',
    gradient: 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)',
    bg: '#fafafa',
    card: '#ffffff',
    cardBorder: '#e4e4e7',
    accent: '#dc2626',
    text: '#18181b',
    textSecondary: '#52525b',
    textMuted: '#a1a1aa',
  },
};
