ALTER TABLE checklist_item
  ADD COLUMN form_id BIGINT REFERENCES form (id);

ALTER TABLE checklist_item
  ADD COLUMN observations JSONB;