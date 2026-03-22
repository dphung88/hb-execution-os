create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'team_member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'blocked', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  due_date date,
  owner_user_id uuid not null references public.profiles(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_owner_user_id_idx on public.tasks(owner_user_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_priority_idx on public.tasks(priority);
create index if not exists tasks_due_date_idx on public.tasks(due_date);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id);

create policy "tasks_select_authenticated"
on public.tasks
for select
to authenticated
using (true);

create policy "tasks_insert_authenticated"
on public.tasks
for insert
to authenticated
with check (auth.uid() = owner_user_id and auth.uid() = created_by);

create policy "tasks_update_owner_or_creator"
on public.tasks
for update
to authenticated
using (auth.uid() = owner_user_id or auth.uid() = created_by)
with check (auth.uid() = owner_user_id or auth.uid() = created_by);

create or replace view public.task_overview
with (security_invoker = true) as
select
  t.id,
  t.title,
  t.description,
  t.status,
  t.priority,
  t.due_date,
  t.owner_user_id,
  t.created_by,
  t.created_at,
  t.updated_at,
  p.full_name as owner_name,
  p.email as owner_email
from public.tasks t
left join public.profiles p on p.id = t.owner_user_id;

grant select on public.task_overview to authenticated;
