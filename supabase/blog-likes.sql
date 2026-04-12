-- 1. blog_likes cedveli - her istifadeci her bloga yalniz 1 defe like qoya biler
CREATE TABLE IF NOT EXISTS public.blog_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blog_id, user_id)
);

-- 2. Row Level Security
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

-- Herkes oxuya biler (like sayini gormek ucun)
CREATE POLICY "Anyone can read blog_likes"
  ON public.blog_likes FOR SELECT
  USING (true);

-- Ancaq auth olmus istifadeciler like qoya biler
CREATE POLICY "Authenticated users can insert blog_likes"
  ON public.blog_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Oz likeni sile biler
CREATE POLICY "Users can delete own blog_like"
  ON public.blog_likes FOR DELETE
  USING (auth.uid() = user_id);

-- 3. RPC funksiyalari - atomik artirma/azaltma (race condition qarsisini alir)
CREATE OR REPLACE FUNCTION public.increment_blog_likes(blog_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blogs SET likes = likes + 1 WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_blog_likes(blog_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blogs SET likes = GREATEST(likes - 1, 0) WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Index performans ucun
CREATE INDEX IF NOT EXISTS idx_blog_likes_blog_id ON public.blog_likes(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user_id ON public.blog_likes(user_id);
