-- Keep one visa_info row per country. Older seed files inserted a few duplicates,
-- which breaks .single() reads and makes visa country cards appear twice.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY country_id
      ORDER BY
        CASE
          WHEN official_url IS NOT NULL AND official_url NOT ILIKE '%wikipedia.org%' THEN 0
          ELSE 1
        END,
        CASE WHEN official_visa_url IS NOT NULL THEN 0 ELSE 1 END,
        CASE WHEN evisa_url IS NOT NULL THEN 0 ELSE 1 END,
        CASE WHEN appointment_url IS NOT NULL THEN 0 ELSE 1 END,
        last_verified_at DESC NULLS LAST,
        id
    ) AS rn
  FROM visa_info
)
DELETE FROM visa_info
WHERE id IN (
  SELECT id FROM ranked WHERE rn > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_visa_info_country_id_unique
  ON visa_info (country_id);
