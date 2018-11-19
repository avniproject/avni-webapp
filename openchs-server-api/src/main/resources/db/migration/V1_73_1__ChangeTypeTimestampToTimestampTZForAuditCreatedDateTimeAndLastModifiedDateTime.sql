BEGIN;
SET LOCAL timezone='UTC';
ALTER TABLE audit ALTER created_date_time TYPE timestamptz;
ALTER TABLE audit ALTER last_modified_date_time TYPE timestamptz;
ALTER TABLE users ALTER created_date_time TYPE timestamptz;
ALTER TABLE users ALTER last_modified_date_time TYPE timestamptz;
COMMIT;
