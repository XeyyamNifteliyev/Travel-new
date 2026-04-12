-- Faza 2: Companions, Tours, Companies, YouTube Links, Comments, Leaderboard

-- ==========================================
-- 1. COMPANIONS (Yoldaş Axtarışı)
-- ==========================================
create table companions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  destination_country text not null,
  destination_city text,
  departure_date date not null,
  return_date date,
  gender_preference text check (gender_preference in ('any', 'male', 'female')),
  age_min int default 18,
  age_max int default 99,
  interests text[] default '{}',
  languages text[] default '{}',
  description text,
  status text check (status in ('open', 'filled', 'cancelled')) default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- 2. YOUTUBE LINKS (Video Paylaşma)
-- ==========================================
create table youtube_links (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  youtube_url text not null,
  title text not null,
  description text,
  thumbnail_url text,
  destination_country text,
  destination_city text,
  language text check (language in ('az', 'ru', 'en')) default 'az',
  views int default 0,
  likes int default 0,
  status text check (status in ('active', 'hidden')) default 'active',
  created_at timestamptz default now()
);

-- ==========================================
-- 3. TOUR COMPANIES (Tur Şirkətləri)
-- ==========================================
create table tour_companies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  company_name text not null,
  logo_url text,
  license_number text,
  description text,
  phone text,
  whatsapp text,
  telegram text,
  email text,
  website text,
  plan_type text check (plan_type in ('starter', 'pro', 'premium')) default 'starter',
  plan_expires_at timestamptz,
  is_verified boolean default false,
  rating numeric(3,2) default 0.00,
  review_count int default 0,
  status text check (status in ('pending', 'active', 'suspended')) default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- 4. TOURS (Tur Elanları)
-- ==========================================
create table tours (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references tour_companies(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  description text not null,
  region text not null,
  tour_type text check (tour_type in ('active', 'cultural', 'gastronomy', 'family', 'solo', 'nature', 'historical')) default 'active',
  price numeric(10,2) not null,
  currency text default 'AZN',
  duration_days int not null,
  duration_nights int default 0,
  group_min int default 1,
  group_max int default 20,
  transportation_included boolean default false,
  hotel_included boolean default false,
  hotel_stars int,
  meals_included text[] default '{}',
  languages text[] default '{az}',
  dates date[] default '{}',
  itinerary jsonb,
  images text[] default '{}',
  rating numeric(3,2) default 0.00,
  review_count int default 0,
  status text check (status in ('draft', 'active', 'completed', 'cancelled')) default 'draft',
  views int default 0,
  bookings_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- 5. TOUR BOOKINGS (Tur Rezervasiyaları)
-- ==========================================
create table tour_bookings (
  id uuid default uuid_generate_v4() primary key,
  tour_id uuid references tours(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  guests_count int default 1,
  selected_date date not null,
  total_price numeric(10,2) not null,
  status text check (status in ('pending', 'confirmed', 'cancelled', 'completed')) default 'pending',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- 6. TOUR REVIEWS (Tur Rəyləri)
-- ==========================================
create table tour_reviews (
  id uuid default uuid_generate_v4() primary key,
  tour_id uuid references tours(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  booking_id uuid references tour_bookings(id) on delete set null,
  rating int check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamptz default now()
);

-- ==========================================
-- 7. BLOG COMMENTS (Blog Şərhləri)
-- ==========================================
create table blog_comments (
  id uuid default uuid_generate_v4() primary key,
  blog_id uuid references blogs(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- 8. USER COUNTRIES (Getdiyi Ölkələr)
-- ==========================================
create table user_countries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  country_slug text not null,
  visited_at date,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, country_slug)
);

-- ==========================================
-- 9. LEADERBOARD STATS (Liderlik Cədvəli)
-- ==========================================
create table leaderboard_stats (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  month int not null,
  year int not null,
  total_views int default 0,
  total_shares int default 0,
  total_likes int default 0,
  blog_count int default 0,
  profile_visits int default 0,
  created_at timestamptz default now(),
  unique(user_id, month, year)
);

-- ==========================================
-- 10. NOTIFICATIONS (Bildirişlər)
-- ==========================================
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ==========================================
-- RLS Policies
-- ==========================================
alter table companions enable row level security;
alter table youtube_links enable row level security;
alter table tour_companies enable row level security;
alter table tours enable row level security;
alter table tour_bookings enable row level security;
alter table tour_reviews enable row level security;
alter table blog_comments enable row level security;
alter table user_countries enable row level security;
alter table leaderboard_stats enable row level security;
alter table notifications enable row level security;

-- Companions
create policy "Companions viewable by everyone" on companions for select using (status = 'open');
create policy "Users can create companions" on companions for insert with check (auth.uid() = user_id);
create policy "Users can update own companions" on companions for update using (auth.uid() = user_id);
create policy "Users can delete own companions" on companions for delete using (auth.uid() = user_id);

-- YouTube Links
create policy "YouTube links viewable by everyone" on youtube_links for select using (status = 'active');
create policy "Users can create youtube links" on youtube_links for insert with check (auth.uid() = user_id);
create policy "Users can update own youtube links" on youtube_links for update using (auth.uid() = user_id);
create policy "Users can delete own youtube links" on youtube_links for delete using (auth.uid() = user_id);

-- Tour Companies
create policy "Tour companies viewable by everyone" on tour_companies for select using (status = 'active');
create policy "Users can create tour companies" on tour_companies for insert with check (auth.uid() = user_id);
create policy "Users can update own tour companies" on tour_companies for update using (auth.uid() = user_id);

-- Tours
create policy "Tours viewable by everyone" on tours for select using (status = 'active');
create policy "Companies can create tours" on tours for insert with check (
  exists (select 1 from tour_companies where id = company_id and user_id = auth.uid())
);
create policy "Companies can update own tours" on tours for update using (
  exists (select 1 from tour_companies where id = company_id and user_id = auth.uid())
);
create policy "Companies can delete own tours" on tours for delete using (
  exists (select 1 from tour_companies where id = company_id and user_id = auth.uid())
);

-- Tour Bookings
create policy "Users can view own bookings" on tour_bookings for select using (auth.uid() = user_id);
create policy "Users can create bookings" on tour_bookings for insert with check (auth.uid() = user_id);
create policy "Companies can view bookings for their tours" on tour_bookings for select using (
  exists (
    select 1 from tours t
    join tour_companies tc on t.company_id = tc.id
    where t.id = tour_bookings.tour_id and tc.user_id = auth.uid()
  )
);

-- Tour Reviews
create policy "Reviews viewable by everyone" on tour_reviews for select using (true);
create policy "Users can create reviews" on tour_reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on tour_reviews for update using (auth.uid() = user_id);

-- Blog Comments
create policy "Comments viewable by everyone" on blog_comments for select using (true);
create policy "Users can create comments" on blog_comments for insert with check (auth.uid() = user_id);
create policy "Users can update own comments" on blog_comments for update using (auth.uid() = user_id);
create policy "Users can delete own comments" on blog_comments for delete using (auth.uid() = user_id);

-- User Countries
create policy "User countries viewable by everyone" on user_countries for select using (true);
create policy "Users can manage own countries" on user_countries for all using (auth.uid() = user_id);

-- Leaderboard Stats
create policy "Leaderboard viewable by everyone" on leaderboard_stats for select using (true);
create policy "System can manage leaderboard" on leaderboard_stats for all using (true);

-- Notifications
create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "System can create notifications" on notifications for insert with check (true);

-- ==========================================
-- Helper Functions
-- ==========================================

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger update_companions_updated_at before update on companions for each row execute procedure update_updated_at();
create trigger update_tour_companies_updated_at before update on tour_companies for each row execute procedure update_updated_at();
create trigger update_tours_updated_at before update on tours for each row execute procedure update_updated_at();
create trigger update_tour_bookings_updated_at before update on tour_bookings for each row execute procedure update_updated_at();
create trigger update_blog_comments_updated_at before update on blog_comments for each row execute procedure update_updated_at();

-- Auto-increment blog views
create or replace function increment_blog_views()
returns trigger as $$
begin
  update blogs set views = views + 1 where id = new.id;
  return new;
end;
$$ language plpgsql;

-- Auto-increment youtube views
create or replace function increment_youtube_views()
returns trigger as $$
begin
  update youtube_links set views = views + 1 where id = new.id;
  return new;
end;
$$ language plpgsql;

-- Auto-increment tour views
create or replace function increment_tour_views()
returns trigger as $$
begin
  update tours set views = views + 1 where id = new.id;
  return new;
end;
$$ language plpgsql;

-- Update tour rating on new review
create or replace function update_tour_rating()
returns trigger as $$
begin
  update tours
  set rating = (
    select coalesce(avg(rating), 0) from tour_reviews where tour_id = new.tour_id
  ),
  review_count = (
    select count(*) from tour_reviews where tour_id = new.tour_id
  )
  where id = new.tour_id;
  return new;
end;
$$ language plpgsql;

create trigger on_tour_review_created after insert on tour_reviews for each row execute procedure update_tour_rating();

-- Update company rating on new tour review
create or replace function update_company_rating()
returns trigger as $$
begin
  update tour_companies
  set rating = (
    select coalesce(avg(t.rating), 0)
    from tours t
    where t.company_id = (
      select company_id from tours where id = new.tour_id
    )
  ),
  review_count = (
    select count(*)
    from tour_reviews tr
    join tours t on tr.tour_id = t.id
    where t.company_id = (
      select company_id from tours where id = new.tour_id
    )
  )
  where id = (
    select company_id from tours where id = new.tour_id
  );
  return new;
end;
$$ language plpgsql;

create trigger on_tour_review_for_company after insert on tour_reviews for each row execute procedure update_company_rating();

-- Auto-update user_countries visited_at on insert
create or replace function sync_profile_countries()
returns trigger as $$
begin
  update profiles
  set countries_visited = (
    select array_agg(distinct country_slug) from user_countries where user_id = new.user_id
  )
  where id = new.user_id;
  return new;
end;
$$ language plpgsql;

create trigger on_user_country_added after insert on user_countries for each row execute procedure sync_profile_countries();
