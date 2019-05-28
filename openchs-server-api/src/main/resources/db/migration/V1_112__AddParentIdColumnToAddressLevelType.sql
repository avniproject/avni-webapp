ALTER TABLE address_level_type
  ADD COLUMN parent_id INTEGER REFERENCES address_level_type (id);