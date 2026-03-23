-- Add CPF and date_of_birth to contacts
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS cpf TEXT DEFAULT '';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Case stage enum
CREATE TYPE public.case_stage AS ENUM (
  'contract_signed',
  'document_collection',
  'petition_filed',
  'inss_analysis',
  'medical_exam',
  'awaiting_decision',
  'approved',
  'denied'
);

-- Case urgency enum
CREATE TYPE public.case_urgency AS ENUM ('green', 'yellow', 'orange', 'red');

-- Cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT NOT NULL DEFAULT '',
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL DEFAULT '',
  case_type TEXT NOT NULL DEFAULT '',
  lawyer_name TEXT NOT NULL DEFAULT '',
  stage public.case_stage NOT NULL DEFAULT 'contract_signed',
  urgency public.case_urgency NOT NULL DEFAULT 'green',
  notes TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_cases_created_by ON public.cases(created_by);
CREATE INDEX idx_cases_stage ON public.cases(stage);
CREATE INDEX idx_cases_urgency ON public.cases(urgency);

-- Auto-generate case number
CREATE OR REPLACE FUNCTION public.generate_case_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  next_num INT;
BEGIN
  SELECT COUNT(*) + 1 INTO next_num FROM public.cases;
  NEW.case_number := '#' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_case_number
  BEFORE INSERT ON public.cases
  FOR EACH ROW WHEN (NEW.case_number = '')
  EXECUTE FUNCTION public.generate_case_number();

-- Deadlines table
CREATE TABLE public.deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  case_number TEXT NOT NULL DEFAULT '',
  client_name TEXT NOT NULL DEFAULT '',
  lawyer_name TEXT NOT NULL DEFAULT '',
  deadline_type TEXT NOT NULL DEFAULT '',
  due_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_deadlines_due_date ON public.deadlines(due_date);
CREATE INDEX idx_deadlines_created_by ON public.deadlines(created_by);

-- Settings table
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.settings (key, value) VALUES
  ('firm_name', 'Dra. Helen Assad Advogados & Associados'),
  ('firm_phone', ''),
  ('firm_email', ''),
  ('deadline_petition_hours', '48'),
  ('deadline_documents_days', '5'),
  ('deadline_inactivity_days', '15'),
  ('deadline_appeal_days', '30')
ON CONFLICT (key) DO NOTHING;

-- RLS: Cases
CREATE POLICY "Users can read own cases" ON public.cases FOR SELECT TO authenticated USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert cases" ON public.cases FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own cases" ON public.cases FOR UPDATE TO authenticated USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete cases" ON public.cases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS: Deadlines
CREATE POLICY "Users can read own deadlines" ON public.deadlines FOR SELECT TO authenticated USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert deadlines" ON public.deadlines FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own deadlines" ON public.deadlines FOR UPDATE TO authenticated USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete deadlines" ON public.deadlines FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS: Settings
CREATE POLICY "Authenticated can read settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can modify settings" ON public.settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Triggers updated_at
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_deadlines_updated_at BEFORE UPDATE ON public.deadlines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
