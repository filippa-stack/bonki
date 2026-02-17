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
 * Manages a single shared takeaway per card_session.
 * Auto-saves on change, can be locked when leaving the integration screen.
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

  // Fetch existing takeaway
  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('card_takeaways')
        .select('*')
        .eq('session_id', sessionId)
        .limit(1)
        .single();

      if (cancelled) return;

      if (data && !error) {
        setTakeawayId(data.id);
        setTextState(data.text);
        setLocked(data.locked);
      }
      setLoading(false);
    };

    fetch();
    return () => { cancelled = true; };
  }, [sessionId]);

  // Autosave text
  const setText = useCallback((value: string) => {
    if (locked) return;
    setTextState(value);
    setSaveStatus('saving');

    if (pendingSave.current) clearTimeout(pendingSave.current);
    if (savedIndicatorTimer.current) clearTimeout(savedIndicatorTimer.current);

    pendingSave.current = setTimeout(async () => {
      if (!sessionId) return;

      if (takeawayId) {
        await supabase
          .from('card_takeaways')
          .update({ text: value })
          .eq('id', takeawayId);
      } else {
        const { data } = await supabase
          .from('card_takeaways')
          .insert({ session_id: sessionId, text: value })
          .select('id')
          .single();
        if (data) setTakeawayId(data.id);
      }

      setSaveStatus('saved');
      savedIndicatorTimer.current = setTimeout(() => setSaveStatus('idle'), 1500);
    }, AUTOSAVE_DELAY);
  }, [sessionId, takeawayId, locked]);

  // Lock takeaway
  const lockTakeaway = useCallback(async () => {
    if (!takeawayId && !text.trim()) {
      // Nothing to lock
      setLocked(true);
      return;
    }

    if (!sessionId) return;

    // Ensure saved first
    if (pendingSave.current) {
      clearTimeout(pendingSave.current);
      pendingSave.current = null;
    }

    if (takeawayId) {
      await supabase
        .from('card_takeaways')
        .update({ text, locked: true })
        .eq('id', takeawayId);
    } else if (text.trim()) {
      await supabase
        .from('card_takeaways')
        .insert({ session_id: sessionId, text, locked: true });
    }

    setLocked(true);
  }, [sessionId, takeawayId, text]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (pendingSave.current) clearTimeout(pendingSave.current);
      if (savedIndicatorTimer.current) clearTimeout(savedIndicatorTimer.current);
    };
  }, []);

  return { text, locked, loading, saveStatus, setText, lockTakeaway };
}
