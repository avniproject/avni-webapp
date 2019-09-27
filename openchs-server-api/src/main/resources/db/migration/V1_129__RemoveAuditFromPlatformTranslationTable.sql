ALTER TABLE platform_translation DROP constraint platform_translation_organisation;
DROP POLICY IF EXISTS platform_translation_orgs ON platform_translation;
ALTER TABLE platform_translation DROP COLUMN organisation_id;
ALTER TABLE platform_translation DROP COLUMN audit_id;
ALTER TABLE platform_translation DROP COLUMN version;
ALTER TABLE platform_translation DISABLE ROW LEVEL SECURITY;
ALTER TABLE platform_translation ADD COLUMN created_date_time timestamp with time zone;
ALTER TABLE platform_translation ADD COLUMN last_modified_date_time timestamp with time zone;