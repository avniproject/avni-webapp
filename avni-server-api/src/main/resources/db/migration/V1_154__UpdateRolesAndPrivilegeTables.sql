ALTER TABLE groups
    ADD COLUMN has_all_privileges BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE groups
SET has_all_privileges = true
WHERE name = 'Everyone';
