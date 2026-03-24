
-- Allow admins to update any profile (not just their own)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile or admin can update any"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Update all existing users' positions to assistente_juridico (Time Comercial)
UPDATE public.profiles SET position = 'assistente_juridico' WHERE position = '' OR position IS NULL;
