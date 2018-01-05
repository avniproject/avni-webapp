CREATE TABLE concept (
  id            SERIAL PRIMARY KEY,
  data_type     CHARACTER VARYING(255) NOT NULL,
  high_absolute DOUBLE PRECISION,
  high_normal   DOUBLE PRECISION,
  low_absolute  DOUBLE PRECISION,
  low_normal    DOUBLE PRECISION,
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
  custom_profile JSONB NULL,
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
  created_by_id     BIGINT,
  last_modified_by_id     BIGINT,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

ALTER TABLE ONLY gender
  ADD CONSTRAINT gender_concept FOREIGN KEY (concept_id) REFERENCES concept (id);
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