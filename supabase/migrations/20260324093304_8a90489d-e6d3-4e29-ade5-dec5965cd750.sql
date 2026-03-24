
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position text NOT NULL DEFAULT '';

-- Allow admin to read all profiles (policy already exists but let's ensure it covers the join from Team page)
-- The existing SELECT policy already allows admin OR own profile, which is sufficient.
