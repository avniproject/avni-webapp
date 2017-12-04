CREATE TABLE operational_program (
  id                      SERIAL PRIMARY KEY,
  uuid                    CHARACTER VARYING(255)               NOT NULL,
  organisation_id         INTEGER REFERENCES organisation (id) NOT NULL,
  program_id              INTEGER REFERENCES program (id)      NOT NULL,
  version                 INTEGER                              NOT NULL,
  created_by_id           BIGINT                               NOT NULL,
  last_modified_by_id     BIGINT                               NOT NULL,
  created_date_time       TIMESTAMP                            NOT NULL,
  last_modified_date_time TIMESTAMP                            NOT NULL
);

CREATE TABLE operational_encounter_type (
  id                      SERIAL PRIMARY KEY,
  uuid                    CHARACTER VARYING(255)                 NOT NULL,
  organisation_id         INTEGER REFERENCES organisation (id)   NOT NULL,
  encounter_type_id       INTEGER REFERENCES encounter_type (id) NOT NULL,
  version                 INTEGER                                NOT NULL,
  created_by_id           BIGINT                                 NOT NULL,
  last_modified_by_id     BIGINT                                 NOT NULL,
  created_date_time       TIMESTAMP                              NOT NULL,
  last_modified_date_time TIMESTAMP                              NOT NULL
);
