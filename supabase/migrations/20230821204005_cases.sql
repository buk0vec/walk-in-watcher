begin;

-- remove the supabase_realtime publication
drop
  publication if exists supabase_realtime;

-- re-create the supabase_realtime publication with no tables
create publication supabase_realtime;

commit;

-- create cases table
CREATE TABLE cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  name text,
  phone_number text,
  summary text,
  ticket_needed boolean DEFAULT true,
  ticket_link text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  closed_at timestamp with time zone DEFAULT NULL
);

alter
  publication supabase_realtime add table cases;

-- Turn on security
alter table "cases"
enable row level security;

-- Allow read access for all
create policy "Allow read access to all"
  on cases
  for select
  using (true);

-- Allow write access for all
create policy "Allow insert access to all"
  on cases
  for insert
  with check (true);

create policy "Allow update access to all"
  on cases
  for update
  using (true);

create policy "Allow delete access to all"
  on cases
  for delete
  using (true);
