ALTER TYPE public.case_stage ADD VALUE IF NOT EXISTS 'admin_inss' AFTER 'awaiting_decision';
ALTER TYPE public.case_stage ADD VALUE IF NOT EXISTS 'judicial_action' AFTER 'admin_inss';