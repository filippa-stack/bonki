
-- ================================================
-- FAS 1: Couple Spaces, Members, Prompt Notes
-- ================================================

-- 1. couple_spaces
CREATE TABLE public.couple_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  invite_code text UNIQUE NOT NULL,
  invite_token text UNIQUE NOT NULL,
  partner_a_name text,
  partner_b_name text
);

ALTER TABLE public.couple_spaces ENABLE ROW LEVEL SECURITY;

-- 2. couple_members
CREATE TABLE public.couple_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id uuid NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  role text,
  last_seen_at timestamptz,
  UNIQUE(couple_space_id, user_id)
);

ALTER TABLE public.couple_members ENABLE ROW LEVEL SECURITY;

-- 3. prompt_notes
CREATE TABLE public.prompt_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id uuid NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id text NOT NULL,
  section_id text NOT NULL,
  prompt_id text NOT NULL,
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared')),
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  shared_at timestamptz,
  author_label text,
  is_highlight boolean NOT NULL DEFAULT false,
  UNIQUE(couple_space_id, user_id, card_id, section_id, prompt_id, visibility)
);

ALTER TABLE public.prompt_notes ENABLE ROW LEVEL SECURITY;

-- Index for common queries
CREATE INDEX idx_prompt_notes_space ON public.prompt_notes(couple_space_id);
CREATE INDEX idx_prompt_notes_user ON public.prompt_notes(user_id);
CREATE INDEX idx_prompt_notes_card ON public.prompt_notes(card_id, section_id, prompt_id);

-- Trigger for updated_at
CREATE TRIGGER update_prompt_notes_updated_at
  BEFORE UPDATE ON public.prompt_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================
-- Security definer: check couple space membership
-- ================================================
CREATE OR REPLACE FUNCTION public.is_couple_member(_user_id uuid, _space_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.couple_members
    WHERE user_id = _user_id AND couple_space_id = _space_id
  )
$$;

-- Helper: get user's couple_space_id
CREATE OR REPLACE FUNCTION public.get_user_couple_space_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT couple_space_id FROM public.couple_members
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- ================================================
-- RLS: couple_spaces
-- ================================================
CREATE POLICY "Users can read own couple space"
  ON public.couple_spaces FOR SELECT
  USING (public.is_couple_member(auth.uid(), id));

-- Allow insert for authenticated (bootstrap creates space)
CREATE POLICY "Authenticated users can create couple space"
  ON public.couple_spaces FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Members can update own couple space"
  ON public.couple_spaces FOR UPDATE
  USING (public.is_couple_member(auth.uid(), id));

-- ================================================
-- RLS: couple_members
-- ================================================
CREATE POLICY "Users can read members of own space"
  ON public.couple_members FOR SELECT
  USING (public.is_couple_member(auth.uid(), couple_space_id));

-- Allow self-insert (bootstrap + join)
CREATE POLICY "Authenticated users can join a space"
  ON public.couple_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own membership"
  ON public.couple_members FOR UPDATE
  USING (auth.uid() = user_id);

-- ================================================
-- RLS: prompt_notes
-- ================================================

-- Users can read their own notes (private + shared)
CREATE POLICY "Users can read own notes"
  ON public.prompt_notes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can read shared notes in their space
CREATE POLICY "Users can read shared notes in space"
  ON public.prompt_notes FOR SELECT
  USING (
    visibility = 'shared'
    AND public.is_couple_member(auth.uid(), couple_space_id)
  );

-- Users can insert own notes
CREATE POLICY "Users can insert own notes"
  ON public.prompt_notes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_couple_member(auth.uid(), couple_space_id)
  );

-- Users can update own notes
CREATE POLICY "Users can update own notes"
  ON public.prompt_notes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete own notes
CREATE POLICY "Users can delete own notes"
  ON public.prompt_notes FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- Allow reading couple_spaces by invite_token (for join flow)
-- ================================================
CREATE POLICY "Anyone can read space by invite token"
  ON public.couple_spaces FOR SELECT
  USING (true);
