'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BeltColor, BeltTheme, beltThemes, Technique, Flow, TrainingLog } from '@/types';
import { supabase } from './supabase';
import { useAuth } from './auth-context';

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  belt_color: BeltColor;
  belt_stripes: number;
  bjj_start_date: string | null;
  bio: string | null;
  is_premium?: boolean;
  premium_until?: string | null;
}

interface AppContextType {
  // プロフィール・テーマ
  profile: Profile | null;
  theme: BeltTheme;
  beltColor: BeltColor;
  setBeltColor: (color: BeltColor) => void;
  stripes: number;
  setStripes: (stripes: number) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;

  // プレミアム状態
  isPremium: boolean;

  // 初期ロード状態
  initialLoading: boolean;
  
  // 技
  techniques: Technique[];
  loadingTechniques: boolean;
  addTechnique: (technique: Omit<Technique, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTechnique: (id: string, updates: Partial<Technique>) => Promise<void>;
  deleteTechnique: (id: string) => Promise<void>;
  
  // フロー
  flows: Flow[];
  loadingFlows: boolean;
  addFlow: (flow: Omit<Flow, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateFlow: (id: string, updates: Partial<Flow>) => Promise<void>;
  deleteFlow: (id: string) => Promise<void>;
  
  // 練習日記
  trainingLogs: TrainingLog[];
  loadingLogs: boolean;
  addTrainingLog: (log: Omit<TrainingLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTrainingLog: (id: string, updates: Partial<TrainingLog>) => Promise<void>;
  deleteTrainingLog: (id: string) => Promise<void>;
  getLogsByDate: (date: string) => TrainingLog[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [beltColor, setBeltColorState] = useState<BeltColor>('white');
  const [stripes, setStripesState] = useState(0);
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([]);
  const [loadingTechniques, setLoadingTechniques] = useState(true);
  const [loadingFlows, setLoadingFlows] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const theme = beltThemes[beltColor];

  // プレミアム判定（プロフィールから取得、または有効期限チェック）
  const isPremium = profile?.is_premium === true &&
    (!profile.premium_until || new Date(profile.premium_until) > new Date());

  // プロフィール読み込み
  const loadProfile = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data && !error) {
      setProfile(data);
      setBeltColorState(data.belt_color as BeltColor || 'white');
      setStripesState(data.belt_stripes || 0);
    }
  }, [user]);

  // 技読み込み
  const loadTechniques = useCallback(async () => {
    if (!user) return;
    setLoadingTechniques(true);
    
    const { data, error } = await supabase
      .from('techniques')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      setTechniques(data.map(t => ({
        ...t,
        tags: t.tags || [],
        video_type: 'youtube' as const,
      })));
    }
    setLoadingTechniques(false);
  }, [user]);

  // フロー読み込み
  const loadFlows = useCallback(async () => {
    if (!user) return;
    setLoadingFlows(true);
    
    const { data, error } = await supabase
      .from('flows')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      setFlows(data.map(f => ({
        ...f,
        tags: f.tags || [],
        flow_data: f.flow_data || {},
      })));
    }
    setLoadingFlows(false);
  }, [user]);

  // 練習日記読み込み
  const loadTrainingLogs = useCallback(async () => {
    if (!user) return;
    setLoadingLogs(true);
    
    const { data, error } = await supabase
      .from('training_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('training_date', { ascending: false });
    
    if (data && !error) {
      setTrainingLogs(data);
    }
    setLoadingLogs(false);
  }, [user]);

  // ユーザーログイン時にデータ読み込み
  useEffect(() => {
    const loadAllData = async () => {
      if (user) {
        setInitialLoading(true);
        await Promise.all([
          loadProfile(),
          loadTechniques(),
          loadFlows(),
          loadTrainingLogs(),
        ]);
        // 少し遅延を入れてスプラッシュを表示
        setTimeout(() => setInitialLoading(false), 500);
      } else {
        setProfile(null);
        setTechniques([]);
        setFlows([]);
        setTrainingLogs([]);
        setInitialLoading(false);
      }
    };
    loadAllData();
  }, [user, loadProfile, loadTechniques, loadFlows, loadTrainingLogs]);

  // 帯色変更
  const setBeltColor = async (color: BeltColor) => {
    setBeltColorState(color);
    const maxStripes = beltThemes[color].maxStripes;
    if (stripes > maxStripes) {
      setStripesState(maxStripes);
    }
    
    if (user) {
      await supabase
        .from('profiles')
        .update({ 
          belt_color: color,
          belt_stripes: stripes > maxStripes ? maxStripes : stripes,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
    }
  };

  // ストライプ変更
  const setStripes = async (newStripes: number) => {
    setStripesState(newStripes);
    
    if (user) {
      await supabase
        .from('profiles')
        .update({ 
          belt_stripes: newStripes,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
    }
  };

  // プロフィール更新
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  // 技の追加
  const addTechnique = async (technique: Omit<Technique, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('techniques')
      .insert({
        user_id: user.id,
        name: technique.name,
        name_en: technique.name_en,
        category: technique.category,
        technique_type: technique.technique_type,
        description: technique.description,
        video_url: technique.video_url,
        tags: technique.tags,
        mastery_level: technique.mastery_level,
      })
      .select()
      .single();
    
    if (data && !error) {
      setTechniques(prev => [{
        ...data,
        tags: data.tags || [],
        video_type: 'youtube' as const,
      }, ...prev]);
    }
  };

  // 技の更新
  const updateTechnique = async (id: string, updates: Partial<Technique>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('techniques')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (!error) {
      setTechniques(prev => prev.map(t => 
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      ));
    }
  };

  // 技の削除
  const deleteTechnique = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('techniques')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (!error) {
      setTechniques(prev => prev.filter(t => t.id !== id));
    }
  };

  // フローの追加
  const addFlow = async (flow: Omit<Flow, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('flows')
      .insert({
        user_id: user.id,
        name: flow.name,
        description: flow.description,
        tags: flow.tags,
        is_favorite: flow.is_favorite,
      })
      .select()
      .single();
    
    if (data && !error) {
      setFlows(prev => [{
        ...data,
        tags: data.tags || [],
      }, ...prev]);
    }
  };

  // フローの更新
  const updateFlow = async (id: string, updates: Partial<Flow>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('flows')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (!error) {
      setFlows(prev => prev.map(f => 
        f.id === id ? { ...f, ...updates, updated_at: new Date().toISOString() } : f
      ));
    }
  };

  // フローの削除
  const deleteFlow = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('flows')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (!error) {
      setFlows(prev => prev.filter(f => f.id !== id));
    }
  };

  // 練習日記の追加
  const addTrainingLog = async (log: Omit<TrainingLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('training_logs')
      .insert({
        user_id: user.id,
        training_date: log.training_date,
        start_time: log.start_time,
        end_time: log.end_time,
        duration_minutes: log.duration_minutes,
        content: log.content,
        notes: log.notes,
        condition: log.condition,
        sparring_rounds: log.sparring_rounds,
      })
      .select()
      .single();
    
    if (data && !error) {
      setTrainingLogs(prev => [data, ...prev]);
    }
  };

  // 練習日記の更新
  const updateTrainingLog = async (id: string, updates: Partial<TrainingLog>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('training_logs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (!error) {
      setTrainingLogs(prev => prev.map(l => 
        l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
      ));
    }
  };

  // 練習日記の削除
  const deleteTrainingLog = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('training_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (!error) {
      setTrainingLogs(prev => prev.filter(l => l.id !== id));
    }
  };

  // 日付で練習日記を取得（複数対応）
  const getLogsByDate = (date: string) => {
    return trainingLogs.filter(l => l.training_date === date);
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        theme,
        beltColor,
        setBeltColor,
        stripes,
        setStripes,
        updateProfile,
        isPremium,
        initialLoading,
        techniques,
        loadingTechniques,
        addTechnique,
        updateTechnique,
        deleteTechnique,
        flows,
        loadingFlows,
        addFlow,
        updateFlow,
        deleteFlow,
        trainingLogs,
        loadingLogs,
        addTrainingLog,
        updateTrainingLog,
        deleteTrainingLog,
        getLogsByDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
