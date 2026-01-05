import { supabase } from './supabase';
import { Technique, Flow } from '@/types';

export type SharedContentType = 'technique' | 'flow';
export type Visibility = 'public' | 'link_only';

export interface SharedContent {
  id: string;
  content_type: SharedContentType;
  content_data: any;
  share_code: string;
  visibility: Visibility;
  title: string;
  description?: string;
  created_by?: string;
  created_at: string;
}

// ランダムな共有コードを生成（6桁の英数字）
function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// コンテンツを共有
export async function shareContent(
  contentType: SharedContentType,
  contentData: any,
  title: string,
  visibility: Visibility,
  description?: string,
  userId?: string
): Promise<{ success: boolean; shareCode?: string; error?: string }> {
  try {
    const shareCode = generateShareCode();

    // Supabaseを試す
    if (userId) {
      const { data, error } = await supabase
        .from('shared_content')
        .insert({
          content_type: contentType,
          content_data: contentData,
          share_code: shareCode,
          visibility,
          title,
          description,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase share error:', error);
        // フォールバック: LocalStorage
        return shareToLocalStorage(contentType, contentData, shareCode, visibility, title, description);
      }

      return { success: true, shareCode };
    } else {
      // ログインしていない場合はLocalStorage
      return shareToLocalStorage(contentType, contentData, shareCode, visibility, title, description);
    }
  } catch (error) {
    console.error('Share error:', error);
    return { success: false, error: 'Failed to share content' };
  }
}

// LocalStorageに共有
function shareToLocalStorage(
  contentType: SharedContentType,
  contentData: any,
  shareCode: string,
  visibility: Visibility,
  title: string,
  description?: string
): { success: boolean; shareCode: string } {
  const sharedContent: SharedContent = {
    id: `local-${Date.now()}`,
    content_type: contentType,
    content_data: contentData,
    share_code: shareCode,
    visibility,
    title,
    description,
    created_at: new Date().toISOString(),
  };

  const existing = localStorage.getItem('bjj-hub-shared-content');
  const allShared: SharedContent[] = existing ? JSON.parse(existing) : [];
  allShared.push(sharedContent);
  localStorage.setItem('bjj-hub-shared-content', JSON.stringify(allShared));

  return { success: true, shareCode };
}

// 共有コードからコンテンツを取得
export async function getSharedContent(shareCode: string): Promise<SharedContent | null> {
  try {
    // まずSupabaseから試す
    const { data, error } = await supabase
      .from('shared_content')
      .select('*')
      .eq('share_code', shareCode.toUpperCase())
      .single();

    if (!error && data) {
      return data as SharedContent;
    }

    // LocalStorageから取得
    const existing = localStorage.getItem('bjj-hub-shared-content');
    if (existing) {
      const allShared: SharedContent[] = JSON.parse(existing);
      return allShared.find(c => c.share_code === shareCode.toUpperCase()) || null;
    }

    return null;
  } catch (error) {
    console.error('Get shared content error:', error);
    return null;
  }
}

// 公開されているコンテンツを一覧取得
export async function getPublicContent(
  contentType?: SharedContentType,
  limit: number = 20
): Promise<SharedContent[]> {
  try {
    // Supabaseから取得
    let query = supabase
      .from('shared_content')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    const { data, error } = await query;

    if (!error && data) {
      return data as SharedContent[];
    }

    // フォールバック: LocalStorage
    const existing = localStorage.getItem('bjj-hub-shared-content');
    if (existing) {
      const allShared: SharedContent[] = JSON.parse(existing);
      let filtered = allShared.filter(c => c.visibility === 'public');

      if (contentType) {
        filtered = filtered.filter(c => c.content_type === contentType);
      }

      return filtered
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    }

    return [];
  } catch (error) {
    console.error('Get public content error:', error);
    return [];
  }
}
