import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { supabase } from '@/integrations/supabase/client';

export interface PromptNote {
  id: string;
  promptId: string;
  content: string;
  visibility: 'private' | 'shared';
  isHighlight: boolean;
  authorLabel: string | null;
  updatedAt: string;
  sharedAt: string | null;
}

interface UsePromptNotesReturn {
  notes: Map<string, PromptNote>; // keyed by `${promptId}:${visibility}`
  loading: boolean;
  saveNote: (promptId: string, content: string, visibility?: 'private' | 'shared') => void;
  shareNote: (promptId: string) => void;
  unshareNote: (promptId: string) => void;
  toggleHighlight: (promptId: string) => void;
  getPrivateNote: (promptId: string) => PromptNote | undefined;
  getSharedNote: (promptId: string) => PromptNote | undefined;
  highlightCount: number;
}

const AUTOSAVE_DELAY = 800; // ms

export function usePromptNotes(
  cardId: string,
  sectionId: string,
): UsePromptNotesReturn {
  const { user } = useAuth();
  const { space } = useCoupleSpace();
  const [notes, setNotes] = useState<Map<string, PromptNote>>(new Map());
  const [loading, setLoading] = useState(true);
  const pendingSaves = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Fetch existing notes for this card+section
  useEffect(() => {
    if (!user || !space) {
      setLoading(false);
      return;
    }

    const fetchNotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('prompt_notes')
        .select('*')
        .eq('couple_space_id', space.id)
        .eq('card_id', cardId)
        .eq('section_id', sectionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to fetch prompt notes:', error);
        setLoading(false);
        return;
      }

      const map = new Map<string, PromptNote>();
      for (const row of data || []) {
        const key = `${row.prompt_id}:${row.visibility}`;
        map.set(key, {
          id: row.id,
          promptId: row.prompt_id,
          content: row.content,
          visibility: row.visibility as 'private' | 'shared',
          isHighlight: row.is_highlight,
          authorLabel: row.author_label,
          updatedAt: row.updated_at,
          sharedAt: row.shared_at,
        });
      }
      setNotes(map);
      setLoading(false);
    };

    fetchNotes();
  }, [user, space, cardId, sectionId]);

  // Also fetch shared notes from partner
  useEffect(() => {
    if (!user || !space) return;

    const fetchPartnerShared = async () => {
      const { data } = await supabase
        .from('prompt_notes')
        .select('*')
        .eq('couple_space_id', space.id)
        .eq('card_id', cardId)
        .eq('section_id', sectionId)
        .eq('visibility', 'shared')
        .neq('user_id', user.id);

      if (data) {
        setNotes(prev => {
          const next = new Map(prev);
          for (const row of data) {
            const key = `partner:${row.prompt_id}:shared`;
            next.set(key, {
              id: row.id,
              promptId: row.prompt_id,
              content: row.content,
              visibility: 'shared',
              isHighlight: row.is_highlight,
              authorLabel: row.author_label,
              updatedAt: row.updated_at,
              sharedAt: row.shared_at,
            });
          }
          return next;
        });
      }
    };

    fetchPartnerShared();
  }, [user, space, cardId, sectionId]);

  const upsertNote = useCallback(async (
    promptId: string,
    content: string,
    visibility: 'private' | 'shared',
    extraFields?: { is_highlight?: boolean; shared_at?: string | null },
  ) => {
    if (!user || !space) return;

    const { error } = await supabase
      .from('prompt_notes')
      .upsert(
        {
          couple_space_id: space.id,
          user_id: user.id,
          card_id: cardId,
          section_id: sectionId,
          prompt_id: promptId,
          content,
          visibility,
          ...(extraFields || {}),
        },
        { onConflict: 'couple_space_id,user_id,card_id,section_id,prompt_id,visibility' }
      );

    if (error) {
      console.error('Failed to save prompt note:', error);
    }
  }, [user, space, cardId, sectionId]);

  const saveNote = useCallback((
    promptId: string,
    content: string,
    visibility: 'private' | 'shared' = 'private',
  ) => {
    const key = `${promptId}:${visibility}`;

    // Update local state immediately
    setNotes(prev => {
      const next = new Map(prev);
      const existing = next.get(key);
      next.set(key, {
        id: existing?.id || '',
        promptId,
        content,
        visibility,
        isHighlight: existing?.isHighlight || false,
        authorLabel: existing?.authorLabel || null,
        updatedAt: new Date().toISOString(),
        sharedAt: existing?.sharedAt || null,
      });
      return next;
    });

    // Debounced save to DB
    const existingTimer = pendingSaves.current.get(key);
    if (existingTimer) clearTimeout(existingTimer);

    pendingSaves.current.set(key, setTimeout(() => {
      upsertNote(promptId, content, visibility);
      pendingSaves.current.delete(key);
    }, AUTOSAVE_DELAY));
  }, [upsertNote]);

  const shareNote = useCallback((promptId: string) => {
    const privateKey = `${promptId}:private`;
    const privateNote = notes.get(privateKey);
    if (!privateNote?.content) return;

    const now = new Date().toISOString();
    const sharedKey = `${promptId}:shared`;

    setNotes(prev => {
      const next = new Map(prev);
      next.set(sharedKey, {
        id: '',
        promptId,
        content: privateNote.content,
        visibility: 'shared',
        isHighlight: false,
        authorLabel: null,
        updatedAt: now,
        sharedAt: now,
      });
      return next;
    });

    upsertNote(promptId, privateNote.content, 'shared', { shared_at: now });
  }, [notes, upsertNote]);

  const unshareNote = useCallback((promptId: string) => {
    if (!user || !space) return;
    const sharedKey = `${promptId}:shared`;

    setNotes(prev => {
      const next = new Map(prev);
      next.delete(sharedKey);
      return next;
    });

    supabase
      .from('prompt_notes')
      .delete()
      .eq('couple_space_id', space.id)
      .eq('user_id', user.id)
      .eq('card_id', cardId)
      .eq('section_id', sectionId)
      .eq('prompt_id', promptId)
      .eq('visibility', 'shared')
      .then(({ error }) => {
        if (error) console.error('Failed to delete shared note:', error);
      });
  }, [user, space, cardId, sectionId]);

  const toggleHighlight = useCallback((promptId: string) => {
    const sharedKey = `${promptId}:shared`;
    const note = notes.get(sharedKey);
    if (!note || !user || !space) return;

    const newVal = !note.isHighlight;

    setNotes(prev => {
      const next = new Map(prev);
      next.set(sharedKey, { ...note, isHighlight: newVal });
      return next;
    });

    supabase
      .from('prompt_notes')
      .update({ is_highlight: newVal })
      .eq('couple_space_id', space.id)
      .eq('user_id', user.id)
      .eq('card_id', cardId)
      .eq('section_id', sectionId)
      .eq('prompt_id', promptId)
      .eq('visibility', 'shared')
      .then(({ error }) => {
        if (error) console.error('Failed to toggle highlight:', error);
      });
  }, [notes, user, space, cardId, sectionId]);

  const getPrivateNote = useCallback((promptId: string) => {
    return notes.get(`${promptId}:private`);
  }, [notes]);

  const getSharedNote = useCallback((promptId: string) => {
    return notes.get(`${promptId}:shared`);
  }, [notes]);

  const highlightCount = Array.from(notes.values()).filter(n =>
    n.visibility === 'shared' && n.isHighlight
  ).length;

  // Cleanup pending saves on unmount
  useEffect(() => {
    return () => {
      pendingSaves.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return {
    notes,
    loading,
    saveNote,
    shareNote,
    unshareNote,
    toggleHighlight,
    getPrivateNote,
    getSharedNote,
    highlightCount,
  };
}
