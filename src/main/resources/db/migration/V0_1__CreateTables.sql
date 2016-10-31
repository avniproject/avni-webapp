CREATE TABLE concept (
  id            SERIAL PRIMARY KEY,
  data_type     CHARACTER VARYING(255) NOT NULL,
  high_absolute DOUBLE PRECISION       NOT NULL,
  high_normal   DOUBLE PRECISION       NOT NULL,
  low_absolute  DOUBLE PRECISION       NOT NULL,
  low_normal    DOUBLE PRECISION       NOT NULL,
  name          CHARACTER VARYING(255) NOT NULL,
  uuid          CHARACTER VARYING(255) NOT NULL,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

CREATE TABLE followup_type (
  id         SMALLSERIAL PRIMARY KEY,
  name       CHARACTER VARYING(255) NOT NULL,
  concept_id BIGINT,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

CREATE TABLE gender (
  id         SMALLSERIAL PRIMARY KEY,
  name       CHARACTER VARYING(255) NOT NULL,
  concept_id BIGINT,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

CREATE TABLE individual (
  id                      SERIAL PRIMARY KEY,
  address                 JSONB,
  catchment_id            BIGINT,
  date_of_birth           DATE                   NOT NULL,
  date_of_birth_estimated BOOLEAN                NOT NULL,
  name                    CHARACTER VARYING(255) NOT NULL,
  profile                 JSONB,
  gender_id               BIGINT                 NOT NULL,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

CREATE TABLE individual_program_summary (
  id                  SERIAL PRIMARY KEY,
  encounters          JSONB,
  enrolment_date_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  program_id          BIGINT                      NOT NULL,
  program_outcome_id  BIGINT,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

CREATE TABLE observation_group (
  id             SERIAL PRIMARY KEY,
  encounter_time TIMESTAMP WITHOUT TIME ZONE,
  observations   JSONB,
  individual_id  BIGINT NOT NULL,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

CREATE TABLE program (
  id         SMALLSERIAL PRIMARY KEY,
  name       CHARACTER VARYING(255) NOT NULL,
  concept_id BIGINT,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

CREATE TABLE program_outcome (
  id         SERIAL PRIMARY KEY,
  name       CHARACTER VARYING(255) NOT NULL,
  program_id BIGINT                 NOT NULL,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

ALTER TABLE ONLY individual_program_summary
  ADD CONSTRAINT individual_program_summary_program FOREIGN KEY (program_id) REFERENCES program (id);
ALTER TABLE ONLY observation_group
  ADD CONSTRAINT observation_group_individual FOREIGN KEY (individual_id) REFERENCES individual (id);
ALTER TABLE ONLY gender
  ADD CONSTRAINT gender_concept FOREIGN KEY (concept_id) REFERENCES concept (id);
ALTER TABLE ONLY individual_program_summary
  ADD CONSTRAINT individual_program_summary_program_outcome FOREIGN KEY (program_outcome_id) REFERENCES program_outcome (id);
ALTER TABLE ONLY program_outcome
  ADD CONSTRAINT program_outcome_program FOREIGN KEY (program_id) REFERENCES program (id);
ALTER TABLE ONLY followup_type
  ADD CONSTRAINT followup_type_concept FOREIGN KEY (concept_id) REFERENCES concept (id);
ALTER TABLE ONLY individual
  ADD CONSTRAINT individual_gender FOREIGN KEY (gender_id) REFERENCES gender (id);
ALTER TABLE ONLY program
  ADD CONSTRAINT program_concept FOREIGN KEY (concept_id) REFERENCES concept (id);

ALTER TABLE ONLY concept
  ADD CONSTRAINT concept_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY concept
  ADD CONSTRAINT concept_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);

ALTER TABLE ONLY gender
  ADD CONSTRAINT gender_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY gender
  ADD CONSTRAINT gender_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);

ALTER TABLE ONLY followup_type
  ADD CONSTRAINT followup_type_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY followup_type
  ADD CONSTRAINT followup_type_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);

ALTER TABLE ONLY individual
  ADD CONSTRAINT individual_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY individual
  ADD CONSTRAINT individual_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);