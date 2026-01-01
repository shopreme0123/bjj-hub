'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BeltColor, BeltTheme, beltThemes, User, Technique, Flow, TrainingLog } from '@/types';

// 初期サンプルデータ
const initialTechniques: Technique[] = [
  {
    id: '1',
    user_id: 'demo',
    name: '三角絞め',
    name_en: 'Triangle Choke',
    technique_type: 'submission',
    description: '足を相手の首と腕に絡めて絞める基本的なサブミッション。角度の調整が重要で、自分の体を斜めにすることで絞めが深くなる。',
    tags: ['絞め技', 'クローズドガード系', '初心者向け'],
    mastery_level: 'favorite',
    video_type: 'youtube',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    name: 'シザースイープ',
    name_en: 'Scissor Sweep',
    technique_type: 'sweep',
    description: 'クローズドガードからの基本スイープ。相手の袖と襟を掴み、膝を入れて足をハサミのように動かす。',
    tags: ['スイープ', 'クローズドガード系'],
    mastery_level: 'learned',
    video_type: 'youtube',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'demo',
    name: 'アームバー',
    name_en: 'Armbar',
    technique_type: 'submission',
    description: '相手の腕を伸ばして極める基本的な関節技。',
    tags: ['関節技', 'マウント'],
    mastery_level: 'learning',
    video_type: 'youtube',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialFlows: Flow[] = [
  {
    id: '1',
    user_id: 'demo',
    name: '三角絞めからの派生',
    description: 'クローズドガードから三角絞め、オモプラータへの分岐',
    tags: ['三角絞め', 'クローズド'],
    is_favorite: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    name: 'デラヒーバ→バックテイク',
    description: 'デラヒーバガードからバックを取るまでの流れ',
    tags: ['デラヒーバ', 'バック'],
    is_favorite: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialLogs: TrainingLog[] = [];

interface AppContextType {
  // ユーザー・テーマ
  user: User | null;
  setUser: (user: User | null) => void;
  theme: BeltTheme;
  beltColor: BeltColor;
  setBeltColor: (color: BeltColor) => void;
  stripes: number;
  setStripes: (stripes: number) => void;
  
  // 技
  techniques: Technique[];
  addTechnique: (technique: Omit<Technique, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateTechnique: (id: string, updates: Partial<Technique>) => void;
  deleteTechnique: (id: string) => void;
  
  // フロー
  flows: Flow[];
  addFlow: (flow: Omit<Flow, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateFlow: (id: string, updates: Partial<Flow>) => void;
  deleteFlow: (id: string) => void;
  
  // 練習日記
  trainingLogs: TrainingLog[];
  addTrainingLog: (log: Omit<TrainingLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateTrainingLog: (id: string, updates: Partial<TrainingLog>) => void;
  deleteTrainingLog: (id: string) => void;
  getLogByDate: (date: string) => TrainingLog | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [beltColor, setBeltColor] = useState<BeltColor>('blue');
  const [stripes, setStripes] = useState(2);
  const [techniques, setTechniques] = useState<Technique[]>(initialTechniques);
  const [flows, setFlows] = useState<Flow[]>(initialFlows);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>(initialLogs);

  const theme = beltThemes[beltColor];

  // 帯色変更時にストライプを調整
  useEffect(() => {
    const maxStripes = beltThemes[beltColor].maxStripes;
    if (stripes > maxStripes) {
      setStripes(maxStripes);
    }
  }, [beltColor, stripes]);

  // ローカルストレージからユーザー設定を復元
  useEffect(() => {
    const savedBelt = localStorage.getItem('bjj-hub-belt');
    const savedStripes = localStorage.getItem('bjj-hub-stripes');
    const savedTechniques = localStorage.getItem('bjj-hub-techniques');
    const savedFlows = localStorage.getItem('bjj-hub-flows');
    const savedLogs = localStorage.getItem('bjj-hub-logs');
    
    if (savedBelt && Object.keys(beltThemes).includes(savedBelt)) {
      setBeltColor(savedBelt as BeltColor);
    }
    if (savedStripes) {
      setStripes(parseInt(savedStripes, 10));
    }
    if (savedTechniques) {
      try {
        setTechniques(JSON.parse(savedTechniques));
      } catch (e) {}
    }
    if (savedFlows) {
      try {
        setFlows(JSON.parse(savedFlows));
      } catch (e) {}
    }
    if (savedLogs) {
      try {
        setTrainingLogs(JSON.parse(savedLogs));
      } catch (e) {}
    }
  }, []);

  // 設定を保存
  useEffect(() => {
    localStorage.setItem('bjj-hub-belt', beltColor);
    localStorage.setItem('bjj-hub-stripes', stripes.toString());
  }, [beltColor, stripes]);

  useEffect(() => {
    localStorage.setItem('bjj-hub-techniques', JSON.stringify(techniques));
  }, [techniques]);

  useEffect(() => {
    localStorage.setItem('bjj-hub-flows', JSON.stringify(flows));
  }, [flows]);

  useEffect(() => {
    localStorage.setItem('bjj-hub-logs', JSON.stringify(trainingLogs));
  }, [trainingLogs]);

  // 技の操作
  const addTechnique = (technique: Omit<Technique, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newTechnique: Technique = {
      ...technique,
      id: `tech-${Date.now()}`,
      user_id: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTechniques(prev => [newTechnique, ...prev]);
  };

  const updateTechnique = (id: string, updates: Partial<Technique>) => {
    setTechniques(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
    ));
  };

  const deleteTechnique = (id: string) => {
    setTechniques(prev => prev.filter(t => t.id !== id));
  };

  // フローの操作
  const addFlow = (flow: Omit<Flow, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newFlow: Flow = {
      ...flow,
      id: `flow-${Date.now()}`,
      user_id: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setFlows(prev => [newFlow, ...prev]);
  };

  const updateFlow = (id: string, updates: Partial<Flow>) => {
    setFlows(prev => prev.map(f => 
      f.id === id ? { ...f, ...updates, updated_at: new Date().toISOString() } : f
    ));
  };

  const deleteFlow = (id: string) => {
    setFlows(prev => prev.filter(f => f.id !== id));
  };

  // 練習日記の操作
  const addTrainingLog = (log: Omit<TrainingLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newLog: TrainingLog = {
      ...log,
      id: `log-${Date.now()}`,
      user_id: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTrainingLogs(prev => [newLog, ...prev]);
  };

  const updateTrainingLog = (id: string, updates: Partial<TrainingLog>) => {
    setTrainingLogs(prev => prev.map(l => 
      l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
    ));
  };

  const deleteTrainingLog = (id: string) => {
    setTrainingLogs(prev => prev.filter(l => l.id !== id));
  };

  const getLogByDate = (date: string) => {
    return trainingLogs.find(l => l.training_date === date);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        theme,
        beltColor,
        setBeltColor,
        stripes,
        setStripes,
        techniques,
        addTechnique,
        updateTechnique,
        deleteTechnique,
        flows,
        addFlow,
        updateFlow,
        deleteFlow,
        trainingLogs,
        addTrainingLog,
        updateTrainingLog,
        deleteTrainingLog,
        getLogByDate,
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
