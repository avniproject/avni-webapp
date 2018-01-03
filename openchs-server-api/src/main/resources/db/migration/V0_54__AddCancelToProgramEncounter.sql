ALTER TABLE program_encounter ADD COLUMN cancel_date_time TIMESTAMP,
  ADD COLUMN cancel_observations JSONB;