CREATE TABLE identifier_source (
  id                    SERIAL PRIMARY KEY,
  uuid                  CHARACTER VARYING(255) NOT NULL,
  name                  CHARACTER VARYING(255) NOT NULL,
  type                  text                   NOT NULL,
  catchment_id          integer REFERENCES catchment (id),
  facility_id           integer REFERENCES facility (id),
  minimum_balance       integer                NOT NULL DEFAULT 20,
  batch_generation_size integer                NOT NULL DEFAULT 100,
  options               jsonb                  NOT NULL DEFAULT '{}' :: jsonb,
  version               INTEGER                NOT NULL,
  is_voided             boolean                NOT NULL DEFAULT false,
  organisation_id       INTEGER                NOT NULL DEFAULT 1 REFERENCES organisation (id),
  audit_id              INTEGER                NOT NULL REFERENCES audit (id)
);

ALTER TABLE identifier_source ADD UNIQUE (uuid);
ALTER TABLE identifier_source ADD UNIQUE (name, organisation_id);

CREATE TABLE identifier_assignment (
  id                   SERIAL PRIMARY KEY,
  uuid                 CHARACTER VARYING(255) NOT NULL,
  identifier_source_id INTEGER                NOT NULL REFERENCES identifier_source (id),
  identifier           text                   NOT NULL,
  assignment_order     integer                NOT NULL,
  assigned_to_user_id  integer                NOT NULL REFERENCES users (id),
  individual_id        integer REFERENCES individual (id),
  program_enrolment_id integer REFERENCES program_enrolment (id),
  version              INTEGER                NOT NULL,
  is_voided            BOOLEAN                NOT NULL DEFAULT FALSE,
  organisation_id      INTEGER                NOT NULL DEFAULT 1 REFERENCES organisation (id),
  audit_id             INTEGER                NOT NULL REFERENCES audit (id)
);

ALTER TABLE identifier_assignment ADD UNIQUE (uuid);
ALTER TABLE identifier_assignment ADD UNIQUE (identifier_source_id, identifier, organisation_id);

CREATE TABLE identifier_user_assignment (
  id                       SERIAL PRIMARY KEY,
  uuid                     CHARACTER VARYING(255) NOT NULL,
  identifier_source_id     INTEGER                NOT NULL REFERENCES identifier_source (id),
  assigned_to_user_id      INTEGER                NOT NULL REFERENCES users (id),
  identifier_start         text                   NOT NULL,
  identifier_end           text                   NOT NULL,
  last_assigned_identifier text,
  version                  INTEGER                NOT NULL,
  is_voided                BOOLEAN                NOT NULL DEFAULT FALSE,
  organisation_id          INTEGER                NOT NULL DEFAULT 1 REFERENCES organisation (id),
  audit_id                 INTEGER                NOT NULL REFERENCES audit (id)
);

ALTER TABLE identifier_user_assignment ADD UNIQUE (uuid);
ALTER TABLE identifier_user_assignment ADD UNIQUE (identifier_source_id, assigned_to_user_id, identifier_start);


select enable_rls_on_ref_table('identifier_source');
select enable_rls_on_tx_table('identifier_assignment');
select enable_rls_on_tx_table('identifier_user_assignment');