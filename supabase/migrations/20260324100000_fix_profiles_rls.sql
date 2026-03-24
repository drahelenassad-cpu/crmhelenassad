-- Fix: allow all authenticated users to read all profiles (needed for Team page)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Authenticated users can read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);
