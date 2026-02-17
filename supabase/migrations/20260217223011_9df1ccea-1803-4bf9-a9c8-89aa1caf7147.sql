
-- Allow users to update their own takeaways within their couple space
CREATE POLICY "Members can update own takeaways"
ON public.couple_takeaways
FOR UPDATE
USING (is_couple_member(auth.uid(), couple_space_id) AND auth.uid() = created_by)
WITH CHECK (is_couple_member(auth.uid(), couple_space_id) AND auth.uid() = created_by);
