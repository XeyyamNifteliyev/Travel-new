create table if not exists blog_views (
  id uuid default gen_random_uuid() primary key,
  blog_id uuid references blogs(id) on delete cascade not null,
  user_id uuid references auth.users(id),
  created_at timestamptz default now(),
  unique(blog_id, user_id)
);

alter table blog_views enable row level security;

create policy "Users can insert own views" on blog_views for insert with check (auth.uid() = user_id);

create index idx_blog_views_blog on blog_views(blog_id);

create or replace function increment_blog_views(blog_id uuid)
returns void as $$
begin
  update blogs set views = views + 1 where id = blog_id;
end;
$$ language plpgsql security definer;
