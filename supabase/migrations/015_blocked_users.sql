create table blocked_users (
  id uuid default uuid_generate_v4() primary key,
  blocker_id uuid references profiles(id) on delete cascade not null,
  blocked_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(blocker_id, blocked_id)
);

alter table blocked_users enable row level security;

create policy "Users can view own blocks" on blocked_users for select using (auth.uid() = blocker_id);
create policy "Users can block others" on blocked_users for insert with check (auth.uid() = blocker_id);
create policy "Users can unblock" on blocked_users for delete using (auth.uid() = blocker_id);

create index idx_blocked_users_blocker on blocked_users(blocker_id);
create index idx_blocked_users_blocked on blocked_users(blocked_id);
