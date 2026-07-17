
-- Create temples table
CREATE TABLE public.temples (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  deity TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  timings TEXT NOT NULL DEFAULT '',
  aarti_schedule TEXT[] NOT NULL DEFAULT '{}',
  dress_code TEXT NOT NULL DEFAULT '',
  entry_fee TEXT NOT NULL DEFAULT 'Free',
  official_darshan_link TEXT NOT NULL DEFAULT '',
  contact_info TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '/placeholder.svg',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.temples ENABLE ROW LEVEL SECURITY;

-- Public read access (temples are public data)
CREATE POLICY "Temples are publicly readable"
ON public.temples
FOR SELECT
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_temples_updated_at
BEFORE UPDATE ON public.temples
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
