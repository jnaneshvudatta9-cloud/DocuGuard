-- DocuGuard: Initial Schema Migration
-- Run this in the Supabase SQL editor if the table does not yet exist.
-- If the table already exists with this schema, this migration is safe to skip.

-- Enable UUID extension (already enabled in most Supabase projects)
create extension if not exists "uuid-ossp";

-- Create documents table
create table if not exists public.documents (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  title            text not null,
  category         text not null default 'Other',
  issue_date       date,
  expiry_date      date,
  issuing_organization text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Index for fast user-scoped queries
create index if not exists documents_user_id_idx on public.documents(user_id);
create index if not exists documents_expiry_date_idx on public.documents(expiry_date);

-- Auto-update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
  before update on public.documents
  for each row execute procedure public.set_updated_at();

-- Enable Row Level Security
alter table public.documents enable row level security;

-- RLS Policies: each user can only access their own documents
-- Drop policies first to avoid "already exists" errors on re-run
drop policy if exists "Users can view own documents"   on public.documents;
drop policy if exists "Users can insert own documents" on public.documents;
drop policy if exists "Users can update own documents" on public.documents;
drop policy if exists "Users can delete own documents" on public.documents;

create policy "Users can view own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on public.documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.documents for delete
  using (auth.uid() = user_id);
