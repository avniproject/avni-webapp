CREATE TABLE organisation (
  id                      SERIAL PRIMARY KEY,
  name                    CHARACTER VARYING(255) NOT NULL,
  db_user                 CHARACTER VARYING(255) NOT NULL,
  uuid                    CHARACTER VARYING(255) NOT NULL,
  version                 INTEGER                NOT NULL,
  created_by_id           INTEGER                 NOT NULL,
  last_modified_by_id     INTEGER                 NOT NULL,
  created_date_time       TIMESTAMP              NOT NULL,
  last_modified_date_time TIMESTAMP              NOT NULL
);

INSERT INTO organisation (id, name, db_user, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
    VALUES (1, 'OpenCHS', 'openchs', uuid_generate_v4(), 1, 1, 1, now(), now());

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
