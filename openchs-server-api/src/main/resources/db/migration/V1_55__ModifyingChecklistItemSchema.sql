ALTER TABLE checklist_item
  DROP COLUMN max_date CASCADE;
ALTER TABLE checklist_item
  DROP COLUMN due_date CASCADE;

ALTER TABLE checklist_item
  ADD COLUMN status JSONB NOT NULL DEFAULT '{}' :: JSONB;