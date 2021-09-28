CREATE INDEX IF NOT EXISTS idx_individual_obs
  ON individual USING GIN (observations jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_program_enrolment_obs
  ON program_enrolment USING GIN (observations jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_program_encounter_obs
  ON program_encounter USING GIN (observations jsonb_path_ops);