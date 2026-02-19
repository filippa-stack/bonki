ALTER TABLE public.step_reflections ADD COLUMN IF NOT EXISTS speaker_label text;
ALTER TABLE public.couple_takeaways ADD COLUMN IF NOT EXISTS speaker_label text;