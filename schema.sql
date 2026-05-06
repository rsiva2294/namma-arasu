-- ==========================================
-- NAMMAARASU DATABASE SCHEMA (SUPABASE/POSTGRESQL)
-- ==========================================

-- Enable UUID extension
create extension ifSpace exists "uuid-ossp";

-- 1. PROMISES TABLE
create table if not exists promises (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  framework text not null check (framework in ('Aram', 'Porul', 'Inbam')),
  pillar text not null,
  section text not null,
  category text[] default array[]::text[],
  tags text[] default array[]::text[],
  status text not null default 'Announced' check (status in ('Announced', 'Planned', 'Budget Allocated', 'In Progress', 'Delayed', 'Blocked', 'Completed')),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Critical')),
  progress_percentage integer not null default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  measurable boolean not null default false,
  target_date text,
  budget_amount numeric(15, 2),
  departments text[] default array[]::text[],
  districts text[] default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. UPDATES TABLE (timeline progress logs)
create table if not exists updates (
  id uuid primary key default uuid_generate_v4(),
  promise_id uuid not null references promises(id) on delete cascade,
  title text not null,
  description text not null,
  created_by text not null default 'Official Update',
  created_at timestamptz not null default now()
);

-- 3. EVIDENCE TABLE (citizen-uploaded evidence)
create table if not exists evidence (
  id uuid primary key default uuid_generate_v4(),
  promise_id uuid not null references promises(id) on delete cascade,
  type text not null check (type in ('image', 'video', 'document')),
  file_url text not null,
  district text,
  description text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now()
);

-- 4. COMMENTS TABLE (public discussion)
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  promise_id uuid not null references promises(id) on delete cascade,
  author text not null default 'Anonymous Citizen',
  content text not null,
  created_at timestamptz not null default now()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==========================================

create index if not exists idx_promises_framework on promises(framework);
create index if not exists idx_promises_status on promises(status);
create index if not exists idx_promises_priority on promises(priority);

-- GIN Indexes for array filtering (departments, districts, tags, category)
create index if not exists idx_promises_districts_gin on promises using gin(districts);
create index if not exists idx_promises_departments_gin on promises using gin(departments);
create index if not exists idx_promises_tags_gin on promises using gin(tags);

-- Foreign key indexes
create index if not exists idx_updates_promise_id on updates(promise_id);
create index if not exists idx_evidence_promise_id on evidence(promise_id);
create index if not exists idx_comments_promise_id on comments(promise_id);

-- ==========================================
-- AUTOMATIC UPDATED_AT TRIGGER
-- ==========================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on promises
for each row
execute function update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
alter table promises enable row level security;
alter table updates enable row level security;
alter table evidence enable row level security;
alter table comments enable row level security;

-- 1. Read access: Public can view everything
create policy "Allow public read-only access to promises" on promises for select using (true);
create policy "Allow public read-only access to updates" on updates for select using (true);
create policy "Allow public read-only access to evidence" on evidence for select using (true);
create policy "Allow public read-only access to comments" on comments for select using (true);

-- 2. Write access for Comments & Evidence: Anyone can submit
create policy "Allow anyone to insert comments" on comments for insert with check (true);
create policy "Allow anyone to insert evidence" on evidence for insert with check (true);

-- 3. Write access for Promises & Official Updates: Authenticated administrators only
-- (For production deployment with Supabase Auth)
create policy "Allow authenticated admins to insert promises" on promises for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated admins to update promises" on promises for update using (auth.role() = 'authenticated');
create policy "Allow authenticated admins to delete promises" on promises for delete using (auth.role() = 'authenticated');
create policy "Allow authenticated admins to insert updates" on updates for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated admins to update/delete updates" on updates for all using (auth.role() = 'authenticated');
