import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';

export interface ReflectionResponse {
  id: string;
  reflection_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const AUTOSAVE_DELAY = 800;

export function useReflectionResponses(reflectionIds: string[]) {
  const { user } = useAuth();
  const { space } = useCoupleSpace();
  const [responses, setResponses] = useState<Map<string, ReflectionResponse[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const pendingSaves = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!user || !space || reflectionIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('reflection_responses')
        .select('*')
        .eq('couple_space_id', space.id)
        .in('reflection_id', reflectionIds);

      if (error) {
        console.error('Failed to fetch reflection responses:', error);
        setLoading(false);
        return;
      }

      const map = new Map<string, ReflectionResponse[]>();
      for (const row of data || []) {
        const list = map.get(row.reflection_id) || [];
        list.push(row as ReflectionResponse);
        map.set(row.reflection_id, list);
      }
      setResponses(map);
      setLoading(false);
    };

    fetch();
  }, [user, space, reflectionIds.join(',')]);

  const saveResponse = useCallback((reflectionId: string, content: string) => {
    if (!user || !space) return;

    // Optimistic update
    setResponses(prev => {
      const next = new Map(prev);
      const existing = (next.get(reflectionId) || []);
      const mine = existing.find(r => r.user_id === user.id);
      if (mine) {
        next.set(reflectionId, existing.map(r =>
          r.user_id === user.id ? { ...r, content, updated_at: new Date().toISOString() } : r
        ));
      } else {
        next.set(reflectionId, [...existing, {
          id: '',
          reflection_id: reflectionId,
          user_id: user.id,
          content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);
      }
      return next;
    });

    // Debounced upsert
    const key = `${reflectionId}:${user.id}`;
    const timer = pendingSaves.current.get(key);
    if (timer) clearTimeout(timer);

    pendingSaves.current.set(key, setTimeout(async () => {
      const { error } = await supabase
        .from('reflection_responses')
        .upsert({
          reflection_id: reflectionId,
          user_id: user.id,
          couple_space_id: space.id,
          content,
        }, { onConflict: 'reflection_id,user_id' });

      if (error) console.error('Failed to save response:', error);
      pendingSaves.current.delete(key);
    }, AUTOSAVE_DELAY));
  }, [user, space]);

  const getResponsesForReflection = useCallback((reflectionId: string) => {
    return responses.get(reflectionId) || [];
  }, [responses]);

  const getMyResponse = useCallback((reflectionId: string) => {
    if (!user) return undefined;
    return (responses.get(reflectionId) || []).find(r => r.user_id === user.id);
  }, [responses, user]);

  const getPartnerResponse = useCallback((reflectionId: string) => {
    if (!user) return undefined;
    return (responses.get(reflectionId) || []).find(r => r.user_id !== user.id);
  }, [responses, user]);

  useEffect(() => {
    return () => {
      pendingSaves.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return {
    responses,
    loading,
    saveResponse,
    getResponsesForReflection,
    getMyResponse,
    getPartnerResponse,
  };
}
