ALTER TABLE platform_translation DROP COLUMN created_date_time;
ALTER TABLE platform_translation DROP COLUMN last_modified_date_time;
ALTER TABLE platform_translation ADD COLUMN version INTEGER;
ALTER TABLE platform_translation ADD COLUMN audit_id INTEGER;

ALTER TABLE ONLY platform_translation
    ADD CONSTRAINT platform_translation_audit FOREIGN KEY (audit_id) REFERENCES audit (id);

UPDATE platform_translation
set version  = 1,
    audit_id = create_audit()
WHERE uuid NOTNULL;

ALTER TABLE platform_translation ALTER COLUMN version SET NOT NULL;
ALTER TABLE platform_translation ALTER COLUMN audit_id SET NOT NULL;

