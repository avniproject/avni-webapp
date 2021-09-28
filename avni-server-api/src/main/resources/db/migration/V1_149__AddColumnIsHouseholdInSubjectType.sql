ALTER TABLE subject_type ADD COLUMN is_household BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE group_role DROP CONSTRAINT group_role_org_id;
