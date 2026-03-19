-- Add current_slider_anchors JSONB column to couple_state
-- Stores the active card's slider label data so the Tier 1 check-in page can render real labels
ALTER TABLE public.couple_state
ADD COLUMN current_slider_anchors jsonb DEFAULT NULL;