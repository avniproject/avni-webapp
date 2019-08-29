alter table encounter
  add column earliest_visit_date_time timestamptz,
  add column max_visit_date_time timestamptz,
  add column cancel_date_time timestamptz,
  add COLUMN cancel_observations jsonb,
  add column cancel_location point,
  add column name text;
