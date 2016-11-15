CREATE TABLE concept (
  id            SERIAL PRIMARY KEY,
  data_type     CHARACTER VARYING(255) NOT NULL,
  high_absolute DOUBLE PRECISION       NOT NULL,
  high_normal   DOUBLE PRECISION       NOT NULL,
  low_absolute  DOUBLE PRECISION       NOT NULL,
  low_normal    DOUBLE PRECISION       NOT NULL,
  name          CHARACTER VARYING(255) NOT NULL,
  uuid          CHARACTER VARYING(255) NOT NULL,
  version       INTEGER NOT NULL,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

CREATE TABLE followup_type (
  id         SMALLSERIAL PRIMARY KEY,
  uuid          CHARACTER VARYING(255) NOT NULL,
  name       CHARACTER VARYING(255) NOT NULL,
  concept_id BIGINT,
  version       INTEGER NOT NULL,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

CREATE TABLE gender (
  id         SMALLSERIAL PRIMARY KEY,
  uuid          CHARACTER VARYING(255) NOT NULL,
  name       CHARACTER VARYING(255) NOT NULL,
  concept_id BIGINT,
  version       INTEGER NOT NULL,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

CREATE TABLE address_level (
  id SERIAL PRIMARY KEY,
  title       CHARACTER VARYING(255) NOT NULL,
  uuid          CHARACTER VARYING(255) NOT NULL,
  level       SMALLINT NOT NULL,
  version       INTEGER NOT NULL,
  parent_id INTEGER,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

CREATE TABLE individual (
  id                      SERIAL PRIMARY KEY,
  uuid          CHARACTER VARYING(255) NOT NULL,
  address_id                 BIGINT,
  catchment_id            BIGINT,
  version       INTEGER NOT NULL,
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
  uuid          CHARACTER VARYING(255) NOT NULL,
  version       INTEGER NOT NULL,
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
  uuid          CHARACTER VARYING(255) NOT NULL,
  encounter_time TIMESTAMP WITHOUT TIME ZONE,
  version       INTEGER NOT NULL,
  observations   JSONB,
  individual_id  BIGINT NOT NULL,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

CREATE TABLE program (
  id         SMALLSERIAL PRIMARY KEY,
  uuid          CHARACTER VARYING(255) NOT NULL,
  name       CHARACTER VARYING(255) NOT NULL,
  concept_id BIGINT,
  version       INTEGER NOT NULL,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

CREATE TABLE program_outcome (
  id         SERIAL PRIMARY KEY,
  uuid          CHARACTER VARYING(255) NOT NULL,
  name       CHARACTER VARYING(255) NOT NULL,
  program_id BIGINT                 NOT NULL,
  version       INTEGER NOT NULL,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  uuid          CHARACTER VARYING(255) NOT NULL,
  version       INTEGER NOT NULL,
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
ALTER TABLE ONLY address_level
  ADD CONSTRAINT address_level_parent FOREIGN KEY (parent_id) REFERENCES address_level (id);
ALTER TABLE ONLY individual
  ADD CONSTRAINT individual_address FOREIGN KEY (address_id) REFERENCES address_level (id);
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