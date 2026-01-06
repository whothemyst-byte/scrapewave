import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { ScraperResult, RecentActivity } from '@/types/scraper';
import { useAuth } from '@/hooks/useAuth';

interface AppContextType {
  credits: number;
  setCredits: (credits: number) => void;
  results: ScraperResult[];
  setResults: (results: ScraperResult[]) => void;
  recentActivity: RecentActivity[];
  addActivity: (activity: Omit<RecentActivity, 'id' | 'timestamp'>) => void;
  isAuthenticated: boolean;
  user: User | null;
  authLoading: boolean;
  signOut: () => Promise<{ error: Error | null }>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth();
  const [credits, setCredits] = useState(500);
  const [results, setResults] = useState<ScraperResult[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'scrape',
      description: 'Maps Scraper - "Restaurants" in "New York"',
      timestamp: new Date(Date.now() - 3600000),
      credits_used: 25,
    },
    {
      id: '2',
      type: 'export',
      description: 'Exported 150 results to CSV',
      timestamp: new Date(Date.now() - 7200000),
      credits_used: 5,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user;

  const addActivity = (activity: Omit<RecentActivity, 'id' | 'timestamp'>) => {
    const newActivity: RecentActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setRecentActivity((prev) => [newActivity, ...prev].slice(0, 5));
  };

  return (
    <AppContext.Provider
      value={{
        credits,
        setCredits,
        results,
        setResults,
        recentActivity,
        addActivity,
        isAuthenticated,
        user,
        authLoading,
        signOut,
        isLoading,
        setIsLoading,
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
