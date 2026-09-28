# TaskFlow — Simple Task Manager

TaskFlow is a lightweight task manager where users can register, log in, and manage
their own personal to-do list. Each user only sees and edits their own tasks.

## Live Demo

- **Deployed app:** https://dynamic-melba-f2b7de.netlify.app/
- **Demo video:** https://youtu.be/QhxK7901DN8

## What It Does

- Register a new account with email/password
- Log in and log out
- Add, complete/uncomplete, and delete tasks
- Filter tasks by All / Active / Completed
- Each user's tasks are private — enforced by database-level security rules, not
  just the UI

## Technologies Used

- **Frontend:** HTML, CSS, vanilla JavaScript (no framework, no build step)
- **Backend/Database:** [Supabase](https://supabase.com) (Postgres database + built-in
  authentication)
- **Hosting:** [Netlify](https://netlify.com)

## Project Structure

```
├── index.html          # Single-page app: auth screen + task manager screen
├── css/
│   └── style.css       # All styling
├── js/
│   ├── config.js       # Supabase project URL + public (anon) API key
│   └── app.js          # Auth logic + task CRUD logic
└── supabase-setup.sql  # SQL to create the `tasks` table and security policies
```

## How It Works

- `js/app.js` talks directly to Supabase from the browser using the Supabase
  JavaScript client (loaded via CDN in `index.html`).
- Supabase Auth handles registration, login, logout, and session state.
- Task data lives in a `tasks` table in Supabase's Postgres database.
- **Row Level Security (RLS)** policies (see `supabase-setup.sql`) ensure a user can
  only ever read/insert/update/delete rows where `user_id` matches their own
  authenticated user ID — this is enforced by the database itself, not just the
  frontend.

## Setup Instructions (Run It Yourself)

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier).
2. In the Supabase dashboard, go to **SQL Editor** and run the contents of
   [`supabase-setup.sql`](./supabase-setup.sql) to create the `tasks` table and
   security policies.
3. Go to **Project Settings > API** and copy your **Project URL** and **anon public
   key**.
4. Open `js/config.js` and paste them in:
   ```js
   const SUPABASE_URL = "https://your-project.supabase.co";
   const SUPABASE_ANON_KEY = "your-anon-key";
   ```
   > The anon key is designed to be public — it's safe to commit. Row Level
   > Security is what actually protects user data, not keeping this key secret.
5. Open `index.html` directly in a browser (or serve the folder with any static
   server) — no build step or `npm install` required.

## Deployment

Deployed as a static site on Netlify at https://dynamic-melba-f2b7de.netlify.app/
via drag-and-drop deploy ([Netlify Drop](https://app.netlify.com/drop)).
