ALTER TABLE gender
  ADD COLUMN organisation_id INTEGER NOT NULL DEFAULT 1
  REFERENCES organisation(id);

ALTER TABLE gender ALTER COLUMN organisation_id DROP DEFAULT;
