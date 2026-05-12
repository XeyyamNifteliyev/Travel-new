-- Performance indexes for TravelAZ
-- Addresses common query patterns across the application

CREATE INDEX IF NOT EXISTS idx_visa_info_country_id ON visa_info(country_id);
CREATE INDEX IF NOT EXISTS idx_places_city_status ON places(city_id, status);
CREATE INDEX IF NOT EXISTS idx_places_country_status_cat ON places(country_id, status, category);
CREATE INDEX IF NOT EXISTS idx_blogs_status_created ON blogs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_blog_created ON blog_comments(blog_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companions_status_created ON companions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tours_status_region ON tours(status, region);
