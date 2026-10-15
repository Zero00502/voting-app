-- Paste this in the Supabase SQL Editor and run once.
-- This demo allows anonymous users to submit and view votes. Avoid using it for sensitive data.
create table if not exists public.votes (
  id bigint generated always as identity primary key,
  event_id text not null,
  question integer not null check (question between 0 and 2),
  choice integer not null check (choice between 0 and 3),
  created_at timestamptz not null default now()
);
create index if not exists votes_event_question_idx on public.votes (event_id, question);
alter table public.votes enable row level security;
create policy "public can read demo votes" on public.votes for select to anon using (true);
create policy "public can submit demo votes" on public.votes for insert to anon with check (true);
-- Optional: reset before a new presentation:
-- delete from public.votes where event_id = 'interactive-access-2026-class';
-- Note: users can bypass browser-side one-vote-per-device restrictions; this is a demo, not a secure poll.
