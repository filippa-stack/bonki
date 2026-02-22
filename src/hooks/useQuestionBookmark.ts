import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BookmarkParams {
  coupleSpaceId: string | null;
  sessionId: string | null;
  cardId: string | null;
  stageIndex: number;
  promptIndex: number;
  questionText: string;
}

export function useQuestionBookmark({
  coupleSpaceId,
  sessionId,
  cardId,
  stageIndex,
  promptIndex,
  questionText,
}: BookmarkParams) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if already bookmarked on mount
  useEffect(() => {
    if (!coupleSpaceId || !sessionId || !cardId) return;
    let cancelled = false;

    supabase
      .from('question_bookmarks' as any)
      .select('is_active')
      .eq('couple_space_id', coupleSpaceId)
      .eq('session_id', sessionId)
      .eq('card_id', cardId)
      .eq('stage_index', stageIndex)
      .eq('prompt_index', promptIndex)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) {
          setIsBookmarked((data as any).is_active === true);
        }
      });

    return () => { cancelled = true; };
  }, [coupleSpaceId, sessionId, cardId, stageIndex, promptIndex]);

  const toggle = useCallback(async () => {
    if (!coupleSpaceId || !sessionId || !cardId || loading) return;
    setLoading(true);
    const newState = !isBookmarked;
    setIsBookmarked(newState); // optimistic

    const { error } = await supabase
      .from('question_bookmarks' as any)
      .upsert(
        {
          couple_space_id: coupleSpaceId,
          session_id: sessionId,
          card_id: cardId,
          stage_index: stageIndex,
          prompt_index: promptIndex,
          question_text: questionText,
          is_active: newState,
          bookmarked_at: new Date().toISOString(),
        } as any,
        { onConflict: 'couple_space_id,session_id,card_id,stage_index,prompt_index' }
      );

    if (error) {
      setIsBookmarked(!newState); // revert
      console.error('Bookmark toggle failed:', error);
    }
    setLoading(false);
  }, [coupleSpaceId, sessionId, cardId, stageIndex, promptIndex, questionText, isBookmarked, loading]);

  return { isBookmarked, toggle };
}
