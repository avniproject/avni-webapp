CREATE TABLE program_enrolment (
  id SERIAL PRIMARY KEY,
  program_id SMALLINT NOT NULL,
  individual_id BIGINT NOT NULL,
  program_outcome_id SMALLINT,
  enrolment_profile JSONB,
  enrolment_date_time  TIMESTAMP  NOT NULL,
  uuid  CHARACTER VARYING(255) NOT NULL,
  version INTEGER NOT NULL,
  created_by_id  BIGINT NOT NULL,
  last_modified_by_id  BIGINT NOT NULL,
  created_date_time  TIMESTAMP  NOT NULL,
  last_modified_date_time TIMESTAMP NOT NULL
);

ALTER TABLE ONLY program_enrolment
  ADD CONSTRAINT program_enrolment_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY program_enrolment
  ADD CONSTRAINT program_enrolment_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);
ALTER TABLE ONLY program_enrolment
  ADD CONSTRAINT program_enrolment_program FOREIGN KEY (program_id) REFERENCES program (id);
ALTER TABLE ONLY program_enrolment
  ADD CONSTRAINT program_enrolment_individual FOREIGN KEY (individual_id) REFERENCES individual (id);
ALTER TABLE ONLY program_enrolment
  ADD CONSTRAINT program_enrolment_program_outcome FOREIGN KEY (program_outcome_id) REFERENCES program_outcome (id);


CREATE TABLE program_encounter (
  id SERIAL PRIMARY KEY,
  observations JSONB NOT NULL,
  scheduled_date_time  TIMESTAMP,
  actual_date_time  TIMESTAMP,
  followup_type_id INT NOT NULL,
  program_enrolment_id INTEGER NOT NULL,
  uuid          CHARACTER VARYING(255) NOT NULL,
  version       INTEGER NOT NULL,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

ALTER TABLE ONLY program_encounter
  ADD CONSTRAINT program_encounter_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY program_encounter
  ADD CONSTRAINT program_encounter_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);
ALTER TABLE ONLY program_encounter
  ADD CONSTRAINT program_encounter_followup_type FOREIGN KEY (followup_type_id) REFERENCES followup_type (id);
ALTER TABLE ONLY program_encounter
  ADD CONSTRAINT program_encounter_program_enrolment FOREIGN KEY (program_enrolment_id) REFERENCES program_enrolment (id);
