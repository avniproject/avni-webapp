ALTER TABLE checklist_item_detail
  ADD COLUMN schedule_on_expiry_of_dependency BOOLEAN NOT NULL DEFAULT FALSE;