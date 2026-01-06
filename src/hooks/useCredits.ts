import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // If no record found, it might be a new user - wait for trigger
        if (fetchError.code === 'PGRST116') {
          // Retry after a short delay for new users
          setTimeout(() => fetchCredits(), 1000);
          return;
        }
        throw fetchError;
      }

      setCredits(data?.balance ?? 0);
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError('Failed to fetch credits');
      setCredits(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Subscribe to realtime updates for credits
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user_credits_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && 'balance' in payload.new) {
            setCredits(payload.new.balance as number);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    credits,
    loading,
    error,
    refetchCredits: fetchCredits,
    updateLocalCredits: setCredits,
  };
}