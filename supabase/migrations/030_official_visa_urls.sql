-- Store exact visa information/application URLs separately from generic official/source URLs.
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS official_visa_url TEXT;
ALTER TABLE visa_info ADD COLUMN IF NOT EXISTS official_visa_url_verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_visa_info_official_visa_url
  ON visa_info (official_visa_url)
  WHERE official_visa_url IS NOT NULL;

-- Curated first batch for popular TravelAZ visa destinations.
-- These are official government, embassy, consular, or authorized visa-provider pages.
UPDATE visa_info
SET official_visa_url = updates.official_visa_url,
    official_visa_url_verified_at = NOW()
FROM (
  VALUES
    ('turkey', 'https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa'),
    ('dubai', 'https://u.ae/en/information-and-services/visa-and-emirates-id/visit-visas'),
    ('georgia', 'https://www.geoconsul.gov.ge/en/entering-georgia'),
    ('france', 'https://france-visas.gouv.fr/en/azerbaidjan'),
    ('italy', 'https://ambbaku.esteri.it/it/servizi-consolari-e-visti/servizi-per-il-cittadino-straniero/visti/'),
    ('germany', 'https://baku.diplo.de/az-de/konsularservice/05-visaeinreise/2009392-2009392'),
    ('spain', 'https://azerbaijan.blsspainvisa.com/'),
    ('uk', 'https://www.gov.uk/check-uk-visa'),
    ('united-states', 'https://ais.usvisa-info.com/en-az/niv'),
    ('canada', 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/apply-visitor-visa.html'),
    ('qatar', 'https://hayya.qa/en'),
    ('saudi-arabia', 'https://www.visitsaudi.com/en/about-e-visa')
) AS updates(slug, official_visa_url)
JOIN countries c ON c.slug = updates.slug
WHERE visa_info.country_id = c.id;
