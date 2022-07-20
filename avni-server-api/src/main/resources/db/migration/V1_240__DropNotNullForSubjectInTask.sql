ALTER TABLE task ALTER COLUMN subject_id DROP NOT NULL;

ALTER TABLE task_type DROP COLUMN metadata_search_fields;
ALTER TABLE task_type ADD COLUMN metadata_search_fields text[];

