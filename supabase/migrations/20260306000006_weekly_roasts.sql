-- Create weekly_roasts table
CREATE TABLE IF NOT EXISTS public.weekly_roasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    roast_title TEXT NOT NULL,
    roast_text TEXT NOT NULL,
    tip_text TEXT NOT NULL,
    mascot_mood TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_start)
);

-- Enable RLS
ALTER TABLE public.weekly_roasts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own roasts" 
ON public.weekly_roasts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service roles can insert/update roasts" 
ON public.weekly_roasts FOR ALL 
USING (true)
WITH CHECK (true);
