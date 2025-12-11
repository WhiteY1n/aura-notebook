-- REALTIME CONFIGURATION
-- Enable realtime for tables that need live updates

-- Set REPLICA IDENTITY FULL for sources table to enable realtime updates
ALTER TABLE public.sources REPLICA IDENTITY FULL;

-- Add sources table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.sources;

-- Optional: Enable for notebooks table as well if needed
ALTER TABLE public.notebooks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notebooks;

-- Optional: Enable for notes table if needed
ALTER TABLE public.notes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
