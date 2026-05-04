-- 022: Helpful votes for TravelAZ place reviews.

create table if not exists place_review_helpful_votes (
  id uuid default gen_random_uuid() primary key,
  review_id uuid references place_reviews(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  constraint place_review_helpful_votes_unique unique (review_id, user_id)
);

create index if not exists idx_place_review_helpful_votes_review
  on place_review_helpful_votes(review_id);

create index if not exists idx_place_review_helpful_votes_user
  on place_review_helpful_votes(user_id);

alter table place_review_helpful_votes enable row level security;

create policy "Helpful votes are viewable by everyone" on place_review_helpful_votes
  for select using (true);

create policy "Users can create own helpful votes" on place_review_helpful_votes
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own helpful votes" on place_review_helpful_votes
  for delete using (auth.uid() = user_id);

create or replace function refresh_place_review_helpful_count(review_uuid uuid)
returns void as $$
begin
  update place_reviews
  set
    helpful_count = (
      select count(*)::integer
      from place_review_helpful_votes
      where review_id = review_uuid
    ),
    updated_at = now()
  where id = review_uuid;
end;
$$ language plpgsql security definer;

create or replace function update_place_review_helpful_count()
returns trigger as $$
begin
  if tg_op = 'DELETE' then
    perform refresh_place_review_helpful_count(old.review_id);
    return old;
  end if;

  perform refresh_place_review_helpful_count(new.review_id);
  return new;
end;
$$ language plpgsql security definer;

create trigger update_place_review_helpful_count_after_insert
  after insert on place_review_helpful_votes
  for each row execute procedure update_place_review_helpful_count();

create trigger update_place_review_helpful_count_after_delete
  after delete on place_review_helpful_votes
  for each row execute procedure update_place_review_helpful_count();
