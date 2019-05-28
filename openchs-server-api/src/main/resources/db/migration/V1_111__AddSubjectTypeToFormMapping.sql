ALTER TABLE form_mapping
  ADD COLUMN subject_type_id integer references subject_type(id);



