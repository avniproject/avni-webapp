CREATE TABLE encounter_type (
  id SERIAL PRIMARY KEY,
  name CHARACTER VARYING(255) NOT NULL,
  concept_id BIGINT,
  uuid          CHARACTER VARYING(255) NOT NULL,
  version       INTEGER NOT NULL,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

ALTER TABLE ONLY encounter_type
  ADD CONSTRAINT encounter_type_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY encounter_type
  ADD CONSTRAINT encounter_type_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);
ALTER TABLE ONLY encounter_type
  ADD CONSTRAINT encounter_type_concept FOREIGN KEY (concept_id) REFERENCES concept (id);

CREATE TABLE encounter (
  id SERIAL PRIMARY KEY,
  observations JSONB NOT NULL,
  encounter_date_time  TIMESTAMP,
  encounter_type_id INT NOT NULL,
  individual_id INTEGER NOT NULL,
  uuid          CHARACTER VARYING(255) NOT NULL,
  version       INTEGER NOT NULL,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

ALTER TABLE ONLY encounter
  ADD CONSTRAINT encounter_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY encounter
  ADD CONSTRAINT encounter_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);
ALTER TABLE ONLY encounter
  ADD CONSTRAINT encounter_encounter_type FOREIGN KEY (encounter_type_id) REFERENCES encounter_type (id);
ALTER TABLE ONLY encounter
  ADD CONSTRAINT encounter_individual FOREIGN KEY (individual_id) REFERENCES individual (id);