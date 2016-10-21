CREATE TABLE concept (
  id            BIGINT                 NOT NULL,
  data_type     CHARACTER VARYING(255) NOT NULL,
  high_absolute DOUBLE PRECISION       NOT NULL,
  high_normal   DOUBLE PRECISION       NOT NULL,
  low_absolute  DOUBLE PRECISION       NOT NULL,
  low_normal    DOUBLE PRECISION       NOT NULL,
  name          CHARACTER VARYING(255) NOT NULL,
  uuid          CHARACTER VARYING(255) NOT NULL
);

CREATE TABLE followup_type (
  id         BIGINT                 NOT NULL,
  name       CHARACTER VARYING(255) NOT NULL,
  concept_id BIGINT
);

CREATE TABLE gender (
  id         BIGINT                 NOT NULL,
  name       CHARACTER VARYING(255) NOT NULL,
  concept_id BIGINT
);

CREATE TABLE individual (
  id                      BIGINT                 NOT NULL,
  address                 JSONB,
  catchment_id            BIGINT,
  date_of_birth           DATE                   NOT NULL,
  date_of_birth_estimated BOOLEAN                NOT NULL,
  name                    CHARACTER VARYING(255) NOT NULL,
  profile                 JSONB,
  gender_id               BIGINT                 NOT NULL
);

CREATE TABLE individual_program_summary (
  id                  BIGINT                      NOT NULL,
  encounters          JSONB,
  enrolment_date_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  program_id          BIGINT                      NOT NULL,
  program_outcome_id  BIGINT
);

CREATE TABLE observation_group (
  id             BIGINT NOT NULL,
  encounter_time TIMESTAMP WITHOUT TIME ZONE,
  observations   JSONB,
  individual_id  BIGINT NOT NULL
);

CREATE TABLE program (
  id         BIGINT                 NOT NULL,
  name       CHARACTER VARYING(255) NOT NULL,
  concept_id BIGINT
);

CREATE TABLE program_outcome (
  id         BIGINT                 NOT NULL,
  name       CHARACTER VARYING(255) NOT NULL,
  program_id BIGINT                 NOT NULL
);

CREATE TABLE users (
  id BIGINT NOT NULL
);

ALTER TABLE ONLY concept
  ADD CONSTRAINT concept_pkey PRIMARY KEY (id);
ALTER TABLE ONLY followup_type
  ADD CONSTRAINT followup_type_pkey PRIMARY KEY (id);
ALTER TABLE ONLY gender
  ADD CONSTRAINT gender_pkey PRIMARY KEY (id);
ALTER TABLE ONLY individual
  ADD CONSTRAINT individual_pkey PRIMARY KEY (id);
ALTER TABLE ONLY individual_program_summary
  ADD CONSTRAINT individual_program_summary_pkey PRIMARY KEY (id);
ALTER TABLE ONLY observation_group
  ADD CONSTRAINT observation_group_pkey PRIMARY KEY (id);
ALTER TABLE ONLY program_outcome
  ADD CONSTRAINT program_outcome_pkey PRIMARY KEY (id);
ALTER TABLE ONLY program
  ADD CONSTRAINT program_pkey PRIMARY KEY (id);
ALTER TABLE ONLY users
  ADD CONSTRAINT users_pkey PRIMARY KEY (id);
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