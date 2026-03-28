-- Grant access and disable RLS on marketing_revenue_results so
-- the dashboard and ad-spend form can read/write without auth overhead.

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.marketing_revenue_results to anon, authenticated;

alter table public.marketing_revenue_results disable row level security;

-- Ensure updated_at trigger exists
drop trigger if exists set_marketing_revenue_results_updated_at on public.marketing_revenue_results;
create trigger set_marketing_revenue_results_updated_at
before update on public.marketing_revenue_results
for each row execute procedure public.set_updated_at();
