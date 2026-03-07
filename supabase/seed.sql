-- insert a demo user into auth.users (bypassing normal sign up for demo purposes)
-- Note: id must be a valid UUID.
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'demo@snapmacros.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- insert demo logs
INSERT INTO public.logs (
  user_id,
  meal_name,
  calories,
  protein,
  carbs,
  fat,
  date,
  created_at
) VALUES 
('00000000-0000-0000-0000-000000000000', 'Avocado Toast', 350, 10, 35, 20, CURRENT_DATE, now()),
('00000000-0000-0000-0000-000000000000', 'Chicken Salad', 450, 45, 10, 25, CURRENT_DATE, now()),
('00000000-0000-0000-0000-000000000000', 'Protein Shake', 200, 30, 5, 2, CURRENT_DATE, now())
ON CONFLICT DO NOTHING;
