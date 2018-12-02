ALTER TABLE rule
  ALTER COLUMN form_id DROP NOT NULL;

ALTER TABLE rule
  ADD COLUMN operational_program_id INTEGER;

ALTER TABLE rule
  ADD CONSTRAINT rule_operational_program_id
    FOREIGN KEY (operational_program_id) REFERENCES operational_program(id);

ALTER TABLE rule
  ADD CONSTRAINT only_one_entity_has_value
    CHECK ((form_id IS NOT NULL AND operational_program_id IS NULL) OR
           (form_id IS NULL AND operational_program_id IS NOT NULL));
