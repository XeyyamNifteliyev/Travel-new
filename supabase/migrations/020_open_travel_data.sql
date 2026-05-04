-- 020: Open travel data model for cities, places, reviews, source attribution, and import logs.

create table if not exists cities (
  id uuid default gen_random_uuid() primary key,
  country_id uuid references countries(id) on delete cascade not null,
  slug text not null,
  name_az text not null,
  name_en text,
  name_ru text,
  region text,
  admin_region text,
  lat numeric(10,7),
  lng numeric(10,7),
  population bigint,
  short_desc_az text,
  short_desc_en text,
  short_desc_ru text,
  description_az text,
  description_en text,
  description_ru text,
  cover_photo_id text,
  cover_photo_url text,
  source text default 'manual',
  source_id text,
  source_url text,
  license text,
  attribution_text text,
  is_featured boolean default false,
  popular_rank integer default 999,
  last_synced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint cities_slug_not_empty check (length(trim(slug)) > 0),
  constraint cities_lat_range check (lat is null or (lat >= -90 and lat <= 90)),
  constraint cities_lng_range check (lng is null or (lng >= -180 and lng <= 180)),
  constraint cities_population_non_negative check (population is null or population >= 0),
  constraint cities_country_slug_unique unique (country_id, slug)
);

create table if not exists places (
  id uuid default gen_random_uuid() primary key,
  city_id uuid references cities(id) on delete set null,
  country_id uuid references countries(id) on delete cascade not null,
  slug text not null,
  name text not null,
  name_az text,
  name_en text,
  name_ru text,
  category text not null default 'attraction',
  subcategory text,
  lat numeric(10,7),
  lng numeric(10,7),
  address text,
  website text,
  phone text,
  email text,
  opening_hours text,
  description_az text,
  description_en text,
  description_ru text,
  cover_photo_id text,
  cover_photo_url text,
  source text default 'manual',
  source_place_id text,
  source_url text,
  license text,
  attribution_text text,
  rating_summary numeric(3,2) default 0,
  review_count integer default 0,
  is_featured boolean default false,
  popular_rank integer default 999,
  status text default 'active',
  raw_data jsonb default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint places_slug_not_empty check (length(trim(slug)) > 0),
  constraint places_category_check check (
    category in (
      'attraction',
      'museum',
      'landmark',
      'restaurant',
      'cafe',
      'hotel',
      'viewpoint',
      'historic',
      'park',
      'beach',
      'shopping',
      'nightlife',
      'transport',
      'other'
    )
  ),
  constraint places_status_check check (status in ('active', 'hidden', 'archived')),
  constraint places_lat_range check (lat is null or (lat >= -90 and lat <= 90)),
  constraint places_lng_range check (lng is null or (lng >= -180 and lng <= 180)),
  constraint places_rating_range check (rating_summary >= 0 and rating_summary <= 5),
  constraint places_review_count_non_negative check (review_count >= 0)
);

create table if not exists place_reviews (
  id uuid default gen_random_uuid() primary key,
  place_id uuid references places(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  rating integer not null,
  title text,
  content text not null,
  visit_date date,
  photos text[] default '{}',
  helpful_count integer default 0,
  status text default 'published',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint place_reviews_rating_range check (rating >= 1 and rating <= 5),
  constraint place_reviews_content_not_empty check (length(trim(content)) > 0),
  constraint place_reviews_helpful_non_negative check (helpful_count >= 0),
  constraint place_reviews_status_check check (status in ('pending', 'published', 'rejected', 'hidden')),
  constraint place_reviews_one_per_user unique (place_id, user_id)
);

create table if not exists place_sources (
  id uuid default gen_random_uuid() primary key,
  place_id uuid references places(id) on delete cascade not null,
  source text not null,
  source_id text,
  source_url text,
  license text,
  attribution_text text,
  imported_at timestamptz default now(),
  raw_data jsonb default '{}'::jsonb,
  constraint place_sources_source_check check (
    source in (
      'openstreetmap',
      'overpass',
      'wikivoyage',
      'wikipedia',
      'wikimedia',
      'geonames',
      'manual',
      'travelaz',
      'other'
    )
  )
);

create table if not exists external_import_logs (
  id uuid default gen_random_uuid() primary key,
  source text not null,
  entity_type text not null,
  status text not null default 'running',
  imported_count integer default 0,
  skipped_count integer default 0,
  error text,
  metadata jsonb default '{}'::jsonb,
  started_at timestamptz default now(),
  finished_at timestamptz,
  constraint external_import_logs_status_check check (status in ('running', 'success', 'failed', 'partial')),
  constraint external_import_logs_imported_non_negative check (imported_count >= 0),
  constraint external_import_logs_skipped_non_negative check (skipped_count >= 0)
);

create unique index if not exists idx_places_city_slug_unique
  on places(city_id, slug)
  where city_id is not null;

create unique index if not exists idx_places_country_slug_unique_without_city
  on places(country_id, slug)
  where city_id is null;

create unique index if not exists idx_places_source_unique
  on places(source, source_place_id)
  where source_place_id is not null;

create unique index if not exists idx_place_sources_unique
  on place_sources(place_id, source, source_id)
  where source_id is not null;

create index if not exists idx_cities_country on cities(country_id);
create index if not exists idx_cities_featured on cities(is_featured) where is_featured = true;
create index if not exists idx_cities_popular_rank on cities(popular_rank);
create index if not exists idx_cities_source on cities(source, source_id);

create index if not exists idx_places_country on places(country_id);
create index if not exists idx_places_city on places(city_id);
create index if not exists idx_places_category on places(category);
create index if not exists idx_places_featured on places(is_featured) where is_featured = true;
create index if not exists idx_places_popular_rank on places(popular_rank);
create index if not exists idx_places_status on places(status);
create index if not exists idx_places_rating on places(rating_summary desc, review_count desc);

create index if not exists idx_place_reviews_place on place_reviews(place_id);
create index if not exists idx_place_reviews_user on place_reviews(user_id);
create index if not exists idx_place_reviews_status on place_reviews(status);
create index if not exists idx_place_sources_place on place_sources(place_id);
create index if not exists idx_external_import_logs_source on external_import_logs(source, entity_type, started_at desc);

alter table cities enable row level security;
alter table places enable row level security;
alter table place_reviews enable row level security;
alter table place_sources enable row level security;
alter table external_import_logs enable row level security;

create policy "Cities are viewable by everyone" on cities
  for select using (true);

create policy "Places are viewable by everyone" on places
  for select using (status = 'active');

create policy "Published place reviews are viewable" on place_reviews
  for select using (status = 'published' or auth.uid() = user_id);

create policy "Users can create own place reviews" on place_reviews
  for insert with check (auth.uid() = user_id);

create policy "Users can update own place reviews" on place_reviews
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own place reviews" on place_reviews
  for delete using (auth.uid() = user_id);

create policy "Place sources are viewable by everyone" on place_sources
  for select using (true);

create trigger update_cities_updated_at
  before update on cities
  for each row execute procedure update_updated_at();

create trigger update_places_updated_at
  before update on places
  for each row execute procedure update_updated_at();

create trigger update_place_reviews_updated_at
  before update on place_reviews
  for each row execute procedure update_updated_at();

create or replace function refresh_place_rating_summary(place_uuid uuid)
returns void as $$
begin
  update places
  set
    rating_summary = coalesce((
      select round(avg(rating)::numeric, 2)
      from place_reviews
      where place_id = place_uuid and status = 'published'
    ), 0),
    review_count = (
      select count(*)::integer
      from place_reviews
      where place_id = place_uuid and status = 'published'
    ),
    updated_at = now()
  where id = place_uuid;
end;
$$ language plpgsql security definer;

create or replace function update_place_review_summary()
returns trigger as $$
begin
  if tg_op = 'DELETE' then
    perform refresh_place_rating_summary(old.place_id);
    return old;
  end if;

  perform refresh_place_rating_summary(new.place_id);

  if tg_op = 'UPDATE' and old.place_id <> new.place_id then
    perform refresh_place_rating_summary(old.place_id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger update_place_review_summary_after_insert
  after insert on place_reviews
  for each row execute procedure update_place_review_summary();

create trigger update_place_review_summary_after_update
  after update on place_reviews
  for each row execute procedure update_place_review_summary();

create trigger update_place_review_summary_after_delete
  after delete on place_reviews
  for each row execute procedure update_place_review_summary();
