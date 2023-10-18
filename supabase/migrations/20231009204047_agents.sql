-- create an agents table with an id, username, and name
create table agents (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  name text
);

alter
  publication supabase_realtime add table agents;

-- Turn on security
alter table "agents"
enable row level security;

-- Allow read access for all
create policy "Allow read access to all"
  on agents
  for select
  using (true);

-- Allow write access for all
create policy "Allow insert access to all"
  on agents
  for insert
  with check (true);

create policy "Allow update access to all"
  on agents
  for update
  using (true);

create policy "Allow delete access to all"
  on agents
  for delete
  using (true);


