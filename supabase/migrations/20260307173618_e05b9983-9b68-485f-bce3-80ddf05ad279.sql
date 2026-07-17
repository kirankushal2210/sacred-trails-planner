ALTER TABLE public.temples 
ADD COLUMN facilities text[] NOT NULL DEFAULT '{}'::text[],
ADD COLUMN how_to_reach text NOT NULL DEFAULT '',
ADD COLUMN best_time_to_visit text NOT NULL DEFAULT '',
ADD COLUMN significance text NOT NULL DEFAULT '',
ADD COLUMN nearby_attractions text[] NOT NULL DEFAULT '{}'::text[];