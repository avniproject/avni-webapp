ALTER TABLE individual ADD COLUMN subject_type_id INTEGER REFERENCES subject_type(id);
update individual set subject_type_id = (select id from subject_type where uuid = '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3');
ALTER TABLE individual ALTER COLUMN subject_type_id SET NOT NULL;
