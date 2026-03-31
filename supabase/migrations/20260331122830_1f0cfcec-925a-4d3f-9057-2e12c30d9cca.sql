
-- Update SELECT policies to allow all authenticated users to see all records

-- Contacts
DROP POLICY "Users can read own contacts" ON public.contacts;
CREATE POLICY "Authenticated can read all contacts" ON public.contacts FOR SELECT TO authenticated USING (true);

-- Cases
DROP POLICY "Users can read own cases" ON public.cases;
CREATE POLICY "Authenticated can read all cases" ON public.cases FOR SELECT TO authenticated USING (true);

-- Deadlines
DROP POLICY "Users can read own deadlines" ON public.deadlines;
CREATE POLICY "Authenticated can read all deadlines" ON public.deadlines FOR SELECT TO authenticated USING (true);

-- Activities
DROP POLICY "Users can read own activities" ON public.activities;
CREATE POLICY "Authenticated can read all activities" ON public.activities FOR SELECT TO authenticated USING (true);

-- Also allow all authenticated users to update contacts and cases (team collaboration)
DROP POLICY "Users can update own contacts" ON public.contacts;
CREATE POLICY "Authenticated can update contacts" ON public.contacts FOR UPDATE TO authenticated USING (true);

DROP POLICY "Users can update own cases" ON public.cases;
CREATE POLICY "Authenticated can update cases" ON public.cases FOR UPDATE TO authenticated USING (true);

DROP POLICY "Users can update own deadlines" ON public.deadlines;
CREATE POLICY "Authenticated can update deadlines" ON public.deadlines FOR UPDATE TO authenticated USING (true);
