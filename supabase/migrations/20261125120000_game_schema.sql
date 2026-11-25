-- Sketchy game schema. Rooms and drawings are server-only (the secret word lives in rooms.data).
-- room_players and turn_access only exist so Realtime policies can check channel access.

create table public.rooms (
  code text primary key check (code ~ '^[A-Z]{5}$'),
  data jsonb not null,
  rev integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index rooms_updated_at_idx on public.rooms (updated_at);

create table public.room_players (
  room_code text not null references public.rooms (code) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (room_code, user_id)
);
create index room_players_user_id_idx on public.room_players (user_id);

create table public.turn_access (
  room_code text not null references public.rooms (code) on delete cascade,
  turn_id integer not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  can_draw boolean not null default false,
  solved boolean not null default false,
  primary key (room_code, turn_id, user_id)
);
create index turn_access_user_id_idx on public.turn_access (user_id);

create table public.drawings (
  room_code text not null references public.rooms (code) on delete cascade,
  turn_id integer not null,
  drawer_id uuid not null references auth.users (id) on delete cascade,
  drawer_name text not null,
  drawer_color text not null,
  word text,
  category_id text,
  actions jsonb not null default '[]'::jsonb,
  points integer not null default 0,
  finished boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (room_code, turn_id)
);
create index drawings_drawer_id_idx on public.drawings (drawer_id);

-- RLS on every table. rooms and drawings get no policies: only the server (postgres role) reads them.
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.turn_access enable row level security;
alter table public.drawings enable row level security;

revoke all on public.rooms, public.drawings from anon, authenticated;
revoke all on public.room_players, public.turn_access from anon, authenticated;
grant select on public.room_players, public.turn_access to authenticated;

create policy "players see their own memberships" on public.room_players
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "players see their own turn access" on public.turn_access
  for select to authenticated using ((select auth.uid()) = user_id);

-- Realtime: topics are room:CODE, draw:CODE:TURN and solved:CODE:TURN.
create policy "players receive their room broadcasts" on realtime.messages
  for select to authenticated
  using (
    realtime.messages.extension = 'broadcast'
    and (
      (
        split_part((select realtime.topic()), ':', 1) in ('room', 'draw')
        and exists (
          select 1 from public.room_players rp
          where rp.room_code = split_part((select realtime.topic()), ':', 2)
            and rp.user_id = (select auth.uid())
        )
      )
      or (
        split_part((select realtime.topic()), ':', 1) = 'solved'
        and exists (
          select 1 from public.turn_access ta
          where ta.room_code = split_part((select realtime.topic()), ':', 2)
            and ta.turn_id = case when split_part((select realtime.topic()), ':', 3) ~ '^[0-9]{1,9}$'
                                  then split_part((select realtime.topic()), ':', 3)::integer end
            and ta.user_id = (select auth.uid())
            and (ta.solved or ta.can_draw)
        )
      )
    )
  );

create policy "only this turn's drawer sends strokes" on realtime.messages
  for insert to authenticated
  with check (
    realtime.messages.extension = 'broadcast'
    and split_part((select realtime.topic()), ':', 1) = 'draw'
    and exists (
      select 1 from public.turn_access ta
      where ta.room_code = split_part((select realtime.topic()), ':', 2)
        and ta.turn_id = case when split_part((select realtime.topic()), ':', 3) ~ '^[0-9]{1,9}$'
                              then split_part((select realtime.topic()), ':', 3)::integer end
        and ta.user_id = (select auth.uid())
        and ta.can_draw
    )
  );
