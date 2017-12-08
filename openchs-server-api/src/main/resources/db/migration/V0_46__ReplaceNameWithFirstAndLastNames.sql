ALTER TABLE individual
  ADD COLUMN first_name VARCHAR(256);

ALTER TABLE individual
  ADD COLUMN last_name VARCHAR(256);

ALTER TABLE individual
  DROP COLUMN name;