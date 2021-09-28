CREATE TABLE organisation (
  id                      SERIAL PRIMARY KEY,
  name                    CHARACTER VARYING(255) NOT NULL,
  db_user                 CHARACTER VARYING(255) NOT NULL,
  uuid                    CHARACTER VARYING(255) NOT NULL
);

INSERT INTO organisation (id, name, db_user, uuid)
      VALUES (1, 'OpenCHS', 'openchs', '3539a906-dfae-4ec3-8fbb-1b08f35c3884');

SELECT nextval(pg_get_serial_sequence('organisation', 'id'));

ALTER TABLE address_level ADD COLUMN organisation_id INTEGER NOT NULL DEFAULT 1 REFERENCES organisation(id);
ALTER TABLE catchment ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE catchment_address_mapping ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE checklist ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE checklist_item ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE concept ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE concept_answer ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE encounter ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE encounter_type ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE form ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE form_element ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE form_element_group ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE form_mapping ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE individual ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE program ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE program_encounter ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE program_enrolment ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE program_outcome ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
ALTER TABLE users ADD COLUMN organisation_id INTEGER  NOT NULL DEFAULT 1  REFERENCES organisation(id);
