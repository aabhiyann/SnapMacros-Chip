-- Push notification tokens
-- Stores FCM/APNs device tokens per user so the Edge Function can target them.

create table if not exists push_tokens (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references auth.users(id) on delete cascade,
    token       text not null,
    platform    text not null check (platform in ('ios', 'android', 'web')),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    unique (user_id, token)
);

-- RLS: users can only access their own tokens
alter table push_tokens enable row level security;

create policy "Users manage own push tokens"
    on push_tokens for all
    using  (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Index for fast lookup by user
create index if not exists idx_push_tokens_user_id on push_tokens(user_id);
