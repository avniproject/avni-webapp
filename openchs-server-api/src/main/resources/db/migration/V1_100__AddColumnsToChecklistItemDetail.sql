ALTER TABLE checklist_item_detail
  ADD COLUMN min_days_from_dependent INTEGER,
  ADD COLUMN expires_after INTEGER;