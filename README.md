# The Floor — Board Game Companion

A digital companion for a home board-game adaptation of the TV show **The Floor**.
A **tablet** runs the game, and a **TV** shows the photo prompts, kept in sync in real time.

## How it works

A duel is between two players, played on the defending player's **category**. Both take
turns naming photos from that category. Each has a chess-clock; only the active one runs.
A correct answer switches the clock to the opponent; a pass costs 3 seconds. When a clock
hits zero, that player loses. Answers are judged by the players (honor system) — the app
only manages the clocks and photos.

## Architecture

The tablet and TV never talk directly — both connect to Supabase, which acts as the broker.

```
[ Tablet /control ] -- write --> [ Supabase (games row) ] -- push --> [ TV /tv ]
```

The tablet writes the game state on every press; the TV subscribes and renders it. Devices
pair via a room code: the tablet shows a code (e.g. `ABC`), the TV joins at `/tv?room=ABC`.

## Stack

- Next.js + TypeScript
- Supabase (Postgres + Realtime + Storage)
- Vercel hosting
- PWA on the tablet (Add to Home Screen)

## Game state

The full state is stored as one JSON blob in `games.state`:

```ts
type GameState = {
  phase: 'lobby' | 'pickCategory' | 'duel' | 'result';
  category: string | null;
  photoIndex: number;
  activePlayer: 'A' | 'B';
  running: boolean;       // false = paused
  deadline: number | null;
  timeA: number;
  timeB: number;
};
```

## Database

Three tables — run in the Supabase SQL Editor:

```sql
create table games (
  room       text primary key,
  state      jsonb,
  created_at timestamptz default now()
);
alter publication supabase_realtime add table games;

create table categories (
  id   text primary key,
  name text not null
);

create table photos (
  id          bigint generated always as identity primary key,
  category_id text not null references categories(id) on delete cascade,
  url         text not null
);
create index on photos (category_id);
```

Photos live in Supabase Storage (public bucket `photos`); only the URL goes in `photos.url`.

## Setup

1. Create a Supabase project (EU region) and run the schema above.
2. Create a public Storage bucket named `photos`.
3. Add `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Run:

```bash
npm install
npm run dev
```

- Controller: `http://localhost:3000/control`
- TV: `http://localhost:3000/tv?room=ABC`

## Controller actions

- **Got it** — switch clock to opponent, next photo
- **Pass** — −3 s, same player, next photo
- **Pause** — freeze both clocks

## Notes

- Dev RLS policies are open (`anon` full access) — tighten before any public deploy.
- Aim for ~20 photos per category so a duel doesn't run out.
