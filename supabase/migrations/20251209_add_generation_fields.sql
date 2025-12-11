-- Add generation-related fields to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS icon text DEFAULT '📝',
ADD COLUMN IF NOT EXISTS generation_status text DEFAULT 'completed';

-- Add summary field to sources table
ALTER TABLE public.sources
ADD COLUMN IF NOT EXISTS summary text;

-- Add index for generation_status
CREATE INDEX IF NOT EXISTS idx_projects_generation_status ON public.projects(generation_status);
