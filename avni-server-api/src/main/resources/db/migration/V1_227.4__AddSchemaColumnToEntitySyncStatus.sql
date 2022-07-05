CREATE INDEX IF NOT EXISTS encounter_obs_idx
    ON encounter USING GIN (observations jsonb_path_ops);

CREATE INDEX IF NOT EXISTS encounter_cancel_obs_idx
    ON encounter USING GIN (cancel_observations jsonb_path_ops);

CREATE INDEX IF NOT EXISTS program_encounter_obs_idx
    ON program_encounter USING GIN (observations jsonb_path_ops);

CREATE INDEX IF NOT EXISTS program_encounter_cancel_obs_idx
    ON program_encounter USING GIN (cancel_observations jsonb_path_ops);

CREATE INDEX IF NOT EXISTS program_enrolment_exit_obs_idx
    ON program_enrolment USING GIN (program_exit_observations jsonb_path_ops);

CREATE INDEX IF NOT EXISTS program_enrolment_obs_idx
    ON program_enrolment USING GIN (observations jsonb_path_ops);

CREATE INDEX IF NOT EXISTS checklist_item_obs_idx
    ON checklist_item USING GIN (observations jsonb_path_ops);



