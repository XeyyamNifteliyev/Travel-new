-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (synced with Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  avatar_url text,
  bio text,
  countries_visited text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Blogs table
create table blogs (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  cover_image text,
  language text check (language in ('az', 'ru', 'en')) default 'az',
  tags text[] default '{}',
  views int default 0,
  likes int default 0,
  status text check (status in ('draft', 'published')) default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Countries table
create table countries (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name_az text not null,
  name_ru text not null,
  name_en text not null,
  flag_emoji text,
  description text,
  best_time text,
  avg_costs jsonb,
  popular_places text[] default '{}'
);

-- Visa info table
create table visa_info (
  id uuid default uuid_generate_v4() primary key,
  country_id uuid references countries(id) on delete cascade,
  requirement_type text check (requirement_type in ('required', 'not_required', 'on_arrival', 'e_visa')),
  embassy_link text,
  processing_time text,
  documents text[] default '{}',
  notes_az text,
  notes_ru text,
  notes_en text
);

-- RLS Policies
alter table profiles enable row level security;
alter table blogs enable row level security;
alter table countries enable row level security;
alter table visa_info enable row level security;

-- Profiles: everyone can read, users can update their own
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Blogs: everyone can read published, users can create/update own
create policy "Published blogs are viewable" on blogs for select using (status = 'published');
create policy "Users can create blogs" on blogs for insert with check (auth.uid() = author_id);
create policy "Users can update own blogs" on blogs for update using (auth.uid() = author_id);
create policy "Users can delete own blogs" on blogs for delete using (auth.uid() = author_id);

-- Countries & Visa: everyone can read
create policy "Countries are viewable" on countries for select using (true);
create policy "Visa info is viewable" on visa_info for select using (true);

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
