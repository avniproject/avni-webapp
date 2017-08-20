ALTER TABLE form_mapping DROP COLUMN related_entity;
ALTER TABLE form_mapping ADD COLUMN entity_id BIGINT NULL;