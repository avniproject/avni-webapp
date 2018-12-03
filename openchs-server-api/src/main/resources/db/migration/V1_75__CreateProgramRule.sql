ALTER TABLE rule
  ALTER COLUMN form_id DROP NOT NULL;


CREATE TABLE program_rule (
  id              SMALLSERIAL PRIMARY KEY,
  program_id      INTEGER                       NOT NULL REFERENCES program(id),
  rule_id         INTEGER UNIQUE                NOT NULL REFERENCES rule(id),
  version         INTEGER                       NOT NULL,
  uuid            CHARACTER VARYING(255) UNIQUE NOT NULL,
  audit_id        INTEGER                       NOT NULL REFERENCES audit(id),
  organisation_id INTEGER                       NOT NULL REFERENCES organisation(id),
  is_voided       BOOLEAN                       NOT NULL DEFAULT FALSE
);
