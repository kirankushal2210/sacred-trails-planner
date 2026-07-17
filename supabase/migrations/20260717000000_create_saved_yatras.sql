-- Create saved_yatras table
CREATE TABLE IF NOT EXISTS public.saved_yatras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  origin TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  budget INTEGER NOT NULL,
  temples TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  itinerary JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_yatras ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since there is no Auth UI)
CREATE POLICY "Saved yatras are publicly readable"
ON public.saved_yatras
FOR SELECT
USING (true);

CREATE POLICY "Saved yatras are publicly insertable"
ON public.saved_yatras
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Saved yatras are publicly updatable"
ON public.saved_yatras
FOR UPDATE
USING (true);

CREATE POLICY "Saved yatras are publicly deletable"
ON public.saved_yatras
FOR DELETE
USING (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_saved_yatras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE TRIGGER update_saved_yatras_updated_at_trigger
BEFORE UPDATE ON public.saved_yatras
FOR EACH ROW
EXECUTE FUNCTION public.update_saved_yatras_updated_at();
