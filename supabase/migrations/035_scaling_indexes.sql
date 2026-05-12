-- Additional performance indexes for scaling
-- Complements 034_performance_indexes.sql

-- Countries: slug lookup (used in country detail pages)
CREATE INDEX IF NOT EXISTS idx_countries_slug ON countries(slug);

-- Cities: featured/popular queries (used in home page and city listings)
CREATE INDEX IF NOT EXISTS idx_cities_country_featured ON cities(country_id, is_featured, popular_rank);

-- News: published news ordered by date (used in news listings)
CREATE INDEX IF NOT EXISTS idx_news_published_created ON news(is_published, created_at DESC);

-- Places: active places by city with category filter (used in city detail pages)
CREATE INDEX IF NOT EXISTS idx_places_city_status_cat_featured ON places(city_id, status, category, is_featured);

-- Blogs: published blogs query (used in blog listing)
CREATE INDEX IF NOT EXISTS idx_blogs_published_created ON blogs(status, created_at DESC);