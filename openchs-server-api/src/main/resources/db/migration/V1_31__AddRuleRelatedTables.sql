CREATE TABLE rule_dependency (
  id              SMALLSERIAL PRIMARY KEY,
  uuid            CHARACTER VARYING(255) UNIQUE NOT NULL,
  version         INTEGER                       NOT NULL,
  audit_id        INTEGER                       NOT NULL,
  checksum        VARCHAR                       NOT NULL,
  code            TEXT                          NOT NULL,
  organisation_id INTEGER                       NOT NULL REFERENCES organisation (id)
);

CREATE TABLE rule (
  id                 SMALLSERIAL PRIMARY KEY,
  uuid               CHARACTER VARYING(255) UNIQUE NOT NULL,
  version            INTEGER                       NOT NULL,
  audit_id           INTEGER                       NOT NULL REFERENCES audit (id),
  form_id            INTEGER                       NOT NULL REFERENCES form (id),
  type               VARCHAR                       NOT NULL,
  rule_dependency_id INTEGER                       NOT NULL REFERENCES rule_dependency (id),
  name               VARCHAR                       NOT NULL,
  fn_name            VARCHAR                       NOT NULL,
  data               JSONB,
  organisation_id    INTEGER                       NOT NULL REFERENCES organisation (id)
);