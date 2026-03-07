-- Enable RLS
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- Policies for logs
CREATE POLICY "Users can view their own logs"
    ON logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs"
    ON logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
    ON logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
    ON logs FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for daily_summaries
CREATE POLICY "Users can view their own daily summaries"
    ON daily_summaries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily summaries"
    ON daily_summaries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily summaries"
    ON daily_summaries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily summaries"
    ON daily_summaries FOR DELETE
    USING (auth.uid() = user_id);

-- Storage bucket RLS policies for meal_images
CREATE POLICY "Anyone can view meal_images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'meal_images');

CREATE POLICY "Users can insert meal_images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'meal_images' AND auth.uid() = owner);
