CREATE OR REPLACE FUNCTION public.generate_case_number()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  next_num INT;
BEGIN
  SELECT COUNT(*) + 1 INTO next_num FROM public.cases;
  NEW.case_number := '#' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$;