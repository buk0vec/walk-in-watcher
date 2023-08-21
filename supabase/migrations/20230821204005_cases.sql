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
