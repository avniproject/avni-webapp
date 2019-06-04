ALTER TABLE address_level
  ADD CONSTRAINT unique_name_per_level UNIQUE(title, type_id, parent_id, organisation_id);