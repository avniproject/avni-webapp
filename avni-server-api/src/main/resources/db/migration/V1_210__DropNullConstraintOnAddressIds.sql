ALTER TABLE subject_migration
    ALTER old_address_level_id DROP NOT NULL,
    ALTER new_address_level_id DROP NOT NULL;

ALTER TABLE subject_migration
    ADD COLUMN subject_type_id INTEGER REFERENCES subject_type (id);


UPDATE subject_migration
SET subject_type_id = i.subject_type_id
FROM individual i
WHERE i.id = subject_migration.individual_id;

ALTER TABLE subject_migration
    ALTER COLUMN subject_type_id SET NOT NULL;


