// SESSION MODEL LOCK: Uses couple_takeaways (normalized), NOT card_takeaways.

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';

interface UseCardTakeawayReturn {
  text: string;
  locked: boolean;
  loading: boolean;
  saveStatus: 'idle' | 'saving' | 'saved';
  setText: (text: string) => void;
  lockTakeaway: () => Promise<void>;
}

const AUTOSAVE_DELAY = 800;

/**
 * Manages a single shared takeaway per couple_session (normalized).
 * Reads/writes couple_takeaways. Auto-saves on change, locks on unmount.
 */
export function useCardTakeaway(sessionId: string | null): UseCardTakeawayReturn {
  const { user } = useAuth();
  const { space } = useCoupleSpace();
  const [text, setTextState] = useState('');
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [takeawayId, setTakeawayId] = useState<string | null>(null);
  const pendingSave = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedIndicatorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTextRef = useRef(text);
  latestTextRef.current = text;

  const userId = user?.id;
  const spaceId = space?.id;

  // Fetch existing takeaway from couple_takeaways
  useEffect(() => {
    if (!sessionId || !userId || !spaceId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('couple_takeaways')
        .select('*')
        .eq('session_id', sessionId)
        .eq('created_by', userId)
        .limit(1)
        .single();

      if (cancelled) return;

      if (data && !error) {
        setTakeawayId(data.id);
        setTextState(data.content);
        // If row exists from a previous visit, it's already locked
        setLocked(true);
      }
      setLoading(false);
    };

    fetch();
    return () => { cancelled = true; };
  }, [sessionId, userId, spaceId]);

  // Autosave text with debounce
  const setText = useCallback((value: string) => {
    if (locked) return;
    setTextState(value);
    setSaveStatus('saving');

    if (pendingSave.current) clearTimeout(pendingSave.current);
    if (savedIndicatorTimer.current) clearTimeout(savedIndicatorTimer.current);

    pendingSave.current = setTimeout(async () => {
      if (!sessionId || !userId || !spaceId) return;

      if (takeawayId) {
        await supabase
          .from('couple_takeaways')
          .update({ content: value } as any)
          .eq('id', takeawayId);
      } else if (value.trim()) {
        const { data } = await supabase
          .from('couple_takeaways')
          .insert({
            session_id: sessionId,
            couple_space_id: spaceId,
            content: value,
            created_by: userId,
          } as any)
          .select('id')
          .single();
        if (data) setTakeawayId(data.id);
      }

      setSaveStatus('saved');
      savedIndicatorTimer.current = setTimeout(() => setSaveStatus('idle'), 1500);
    }, AUTOSAVE_DELAY);
  }, [sessionId, userId, spaceId, takeawayId, locked]);

  // Lock takeaway — final persist + set locked
  const lockTakeaway = useCallback(async () => {
    if (pendingSave.current) {
      clearTimeout(pendingSave.current);
      pendingSave.current = null;
    }

    const finalText = latestTextRef.current;

    if (!finalText.trim() || !sessionId || !userId || !spaceId) {
      setLocked(true);
      return;
    }

    if (takeawayId) {
      await supabase
        .from('couple_takeaways')
        .update({ content: finalText } as any)
        .eq('id', takeawayId);
    } else {
      await supabase
        .from('couple_takeaways')
        .insert({
          session_id: sessionId,
          couple_space_id: spaceId,
          content: finalText,
          created_by: userId,
        } as any);
    }

    setLocked(true);
  }, [sessionId, userId, spaceId, takeawayId]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (pendingSave.current) clearTimeout(pendingSave.current);
      if (savedIndicatorTimer.current) clearTimeout(savedIndicatorTimer.current);
    };
  }, []);

  return { text, locked, loading, saveStatus, setText, lockTakeaway };
}
