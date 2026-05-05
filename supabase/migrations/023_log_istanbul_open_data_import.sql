-- 023: Record the Istanbul open-data seed in external_import_logs.

insert into external_import_logs (
  source,
  entity_type,
  status,
  imported_count,
  skipped_count,
  metadata,
  started_at,
  finished_at
)
select
  'open-data-seed',
  'city_places',
  'success',
  9,
  0,
  jsonb_build_object(
    'city', 'istanbul',
    'cities', 1,
    'places', 8,
    'sources', array['wikipedia', 'openstreetmap'],
    'migration', '021_seed_istanbul_open_data.sql'
  ),
  now(),
  now()
where not exists (
  select 1
  from external_import_logs
  where source = 'open-data-seed'
    and entity_type = 'city_places'
    and metadata->>'city' = 'istanbul'
);
