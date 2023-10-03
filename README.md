# Walk In Watcher

This is a full-stack application that monitors the current state of walk-ins at the ITS desk. It is a NextJS frontend w/ a Supabase backend.

## Usage

1. Clone/cd
2. Create .env file in root dir, refer to .env.example

Frontend:
1. `yarn`
2. `yarn dev` or `yarn build` or `yarn start` depending on what you want to do with FE

Backend:
1. Ensure that Docker is installed along with the Supabase CLI
2. `supabase start`

## TODO:

- Better API/handling for editable fields
- Export CSV to JSM
