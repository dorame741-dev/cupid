-- =====================================================================
-- Cupid Presentes — setup do Supabase
-- Cole tudo no Supabase: SQL Editor -> New query -> Run
-- Pode rodar mais de uma vez sem quebrar (usa IF NOT EXISTS / DROP IF EXISTS).
-- =====================================================================

-- ---------- Tabelas ----------

create table if not exists public.sites (
  id         uuid primary key default gen_random_uuid(),
  phone      text unique not null,
  paid       boolean default false,
  quiz_data  jsonb,
  created_at timestamptz default now(),
  paid_at    timestamptz
);

create table if not exists public.app_config (
  key   text primary key,
  value text
);

create table if not exists public.funnel_events (
  id         bigint generated always as identity primary key,
  step       text not null,
  created_at timestamptz default now()
);

create index if not exists funnel_events_created_at_idx on public.funnel_events (created_at);

-- Preço inicial (pode mudar depois no /admin)
insert into public.app_config (key, value) values ('price', '19.90')
on conflict (key) do nothing;

-- ---------- Acesso da API às tabelas ----------
-- Sem isso a API responde 401 "permission denied" em projetos novos.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.sites         to anon, authenticated;
grant select, insert, update         on public.app_config    to anon, authenticated;
grant select, insert                 on public.funnel_events to anon, authenticated;

-- ---------- Permissões (RLS) ----------
-- O app faz tudo pelo navegador com a anon key (inclusive o /admin),
-- então a anon key precisa ler e gravar nessas tabelas.

alter table public.sites         enable row level security;
alter table public.app_config    enable row level security;
alter table public.funnel_events enable row level security;

drop policy if exists "sites_select" on public.sites;
drop policy if exists "sites_insert" on public.sites;
drop policy if exists "sites_update" on public.sites;
drop policy if exists "sites_delete" on public.sites;
create policy "sites_select" on public.sites for select to anon, authenticated using (true);
create policy "sites_insert" on public.sites for insert to anon, authenticated with check (true);
create policy "sites_update" on public.sites for update to anon, authenticated using (true) with check (true);
create policy "sites_delete" on public.sites for delete to anon, authenticated using (true);

drop policy if exists "app_config_select" on public.app_config;
drop policy if exists "app_config_insert" on public.app_config;
drop policy if exists "app_config_update" on public.app_config;
create policy "app_config_select" on public.app_config for select to anon, authenticated using (true);
create policy "app_config_insert" on public.app_config for insert to anon, authenticated with check (true);
create policy "app_config_update" on public.app_config for update to anon, authenticated using (true) with check (true);

drop policy if exists "funnel_select" on public.funnel_events;
drop policy if exists "funnel_insert" on public.funnel_events;
create policy "funnel_select" on public.funnel_events for select to anon, authenticated using (true);
create policy "funnel_insert" on public.funnel_events for insert to anon, authenticated with check (true);

-- ---------- Storage: bucket público para as fotos ----------

insert into storage.buckets (id, name, public)
values ('site-photos', 'site-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "site_photos_read"   on storage.objects;
drop policy if exists "site_photos_upload" on storage.objects;
create policy "site_photos_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'site-photos');
create policy "site_photos_upload" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'site-photos');
