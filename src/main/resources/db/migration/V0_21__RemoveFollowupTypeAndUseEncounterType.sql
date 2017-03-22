ALTER TABLE program_encounter DROP COLUMN followup_type_id;
DROP TABLE followup_type;
ALTER TABLE program_encounter ADD COLUMN encounter_type_id INT NOT NULL DEFAULT 0;
ALTER TABLE ONLY program_encounter
  ADD CONSTRAINT program_encounter_encounter_type FOREIGN KEY (encounter_type_id) REFERENCES encounter_type (id);