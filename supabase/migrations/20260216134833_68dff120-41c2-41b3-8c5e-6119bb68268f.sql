
-- Drop existing policies on reflection_responses
DROP POLICY IF EXISTS "Users can read responses in own space" ON public.reflection_responses;
DROP POLICY IF EXISTS "Users can insert own responses" ON public.reflection_responses;
DROP POLICY IF EXISTS "Users can update own responses" ON public.reflection_responses;
DROP POLICY IF EXISTS "Users can delete own responses" ON public.reflection_responses;

-- SELECT: owner always sees own responses; partner only if underlying prompt is shared
CREATE POLICY "Users can read responses in own space"
  ON public.reflection_responses FOR SELECT
  USING (
    is_couple_member(auth.uid(), couple_space_id)
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.prompt_notes pn
        WHERE pn.id = reflection_responses.reflection_id
          AND pn.couple_space_id = reflection_responses.couple_space_id
          AND pn.visibility = 'shared'
      )
    )
  );

-- INSERT: must be own user_id, member of space, and reflection_id must belong to a prompt_note in same space
CREATE POLICY "Users can insert own responses"
  ON public.reflection_responses FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND is_couple_member(auth.uid(), couple_space_id)
    AND EXISTS (
      SELECT 1 FROM public.prompt_notes pn
      WHERE pn.id = reflection_id
        AND pn.couple_space_id = reflection_responses.couple_space_id
    )
  );

-- UPDATE: own responses only, member check, reflection_id must still match space
CREATE POLICY "Users can update own responses"
  ON public.reflection_responses FOR UPDATE
  USING (
    auth.uid() = user_id
    AND is_couple_member(auth.uid(), couple_space_id)
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.prompt_notes pn
      WHERE pn.id = reflection_id
        AND pn.couple_space_id = reflection_responses.couple_space_id
    )
  );

-- DELETE: own responses only, member check
CREATE POLICY "Users can delete own responses"
  ON public.reflection_responses FOR DELETE
  USING (
    auth.uid() = user_id
    AND is_couple_member(auth.uid(), couple_space_id)
  );
