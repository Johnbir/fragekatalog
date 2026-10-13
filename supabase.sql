-- Einmalig im Supabase SQL Editor ausführen.
-- Jeder darf Antworten EINFÜGEN, aber niemand über den öffentlichen Key LESEN.
-- Gelesen wird nur im Supabase Dashboard (Table Editor -> Export) von der neutralen Person.

create table if not exists public.antworten (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  answers jsonb not null
);

alter table public.antworten enable row level security;

create policy "anonym einfuegen" on public.antworten
  for insert to anon
  with check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) < 100000);

-- Bewusst keine SELECT-Policy für anon: die öffentlichen Seiten können Antworten nicht auslesen.
