import { supabase } from './supabase';
import { Technique, Flow } from '@/types';
import { safeJsonParse, generateSecureCode } from './security';

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

export interface GroupSharedContent {
  id: string;
  group_id: string;
  content_type: SharedContentType;
  content_data: any;
  title: string;
  description?: string;
  shared_by: string;
  created_at: string;
}

// 暗号学的に安全な共有コードを生成（6桁の英数字）
function generateShareCode(): string {
  return generateSecureCode(6);
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
  const allShared: SharedContent[] = safeJsonParse<SharedContent[]>(existing, []);
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
      const allShared = safeJsonParse<SharedContent[]>(existing, []);
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
      const allShared = safeJsonParse<SharedContent[]>(existing, []);
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

// グループにコンテンツを共有
export async function shareToGroup(
  contentType: SharedContentType,
  contentData: any,
  title: string,
  groupId: string,
  description?: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      return { success: false, error: 'ログインが必要です' };
    }

    // Supabaseに保存
    const { data, error } = await supabase
      .from('group_shared_content')
      .insert({
        group_id: groupId,
        content_type: contentType,
        content_data: contentData,
        title,
        description,
        shared_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase group share error:', error);
      // フォールバック: LocalStorage
      return shareToGroupLocalStorage(contentType, contentData, title, groupId, description, userId);
    }

    return { success: true };
  } catch (error) {
    console.error('Group share error:', error);
    return { success: false, error: 'Failed to share to group' };
  }
}

// LocalStorageにグループ共有
function shareToGroupLocalStorage(
  contentType: SharedContentType,
  contentData: any,
  title: string,
  groupId: string,
  description?: string,
  userId?: string
): { success: boolean } {
  const sharedContent: GroupSharedContent = {
    id: `local-group-${Date.now()}`,
    group_id: groupId,
    content_type: contentType,
    content_data: contentData,
    title,
    description,
    shared_by: userId || '',
    created_at: new Date().toISOString(),
  };

  const existing = localStorage.getItem('bjj-hub-group-shared-content');
  const allShared = safeJsonParse<GroupSharedContent[]>(existing, []);
  allShared.push(sharedContent);
  localStorage.setItem('bjj-hub-group-shared-content', JSON.stringify(allShared));

  return { success: true };
}

// グループの共有コンテンツを取得
export async function getGroupSharedContent(
  groupId: string,
  contentType?: SharedContentType,
  limit: number = 50
): Promise<GroupSharedContent[]> {
  try {
    // Supabaseから取得
    let query = supabase
      .from('group_shared_content')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    const { data, error } = await query;

    if (!error && data) {
      return data as GroupSharedContent[];
    }

    // フォールバック: LocalStorage
    const existing = localStorage.getItem('bjj-hub-group-shared-content');
    if (existing) {
      const allShared = safeJsonParse<GroupSharedContent[]>(existing, []);
      let filtered = allShared.filter(c => c.group_id === groupId);

      if (contentType) {
        filtered = filtered.filter(c => c.content_type === contentType);
      }

      return filtered
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    }

    return [];
  } catch (error) {
    console.error('Get group shared content error:', error);
    return [];
  }
}

// グループ共有コンテンツを削除
export async function deleteGroupSharedContent(
  contentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('group_shared_content')
      .delete()
      .eq('id', contentId)
      .eq('shared_by', userId);

    if (error) {
      console.error('Delete group shared content error:', error);
      // LocalStorageからも試す
      const existing = localStorage.getItem('bjj-hub-group-shared-content');
      if (existing) {
        const allShared = safeJsonParse<GroupSharedContent[]>(existing, []);
        const filtered = allShared.filter(c => c.id !== contentId);
        localStorage.setItem('bjj-hub-group-shared-content', JSON.stringify(filtered));
        return { success: true };
      }
      return { success: false, error: '削除に失敗しました' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: '削除に失敗しました' };
  }
}
