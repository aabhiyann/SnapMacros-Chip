-- Returns user_ids who have push tokens but no food log on the given date.
-- Used by the daily-reminder Edge Function.
create or replace function users_without_log_today(target_date date)
returns table(user_id uuid)
language sql
security definer
stable
as $$
    select distinct pt.user_id
    from push_tokens pt
    where not exists (
        select 1 from food_logs fl
        where fl.user_id = pt.user_id
          and fl.created_at::date = target_date
    );
$$;
