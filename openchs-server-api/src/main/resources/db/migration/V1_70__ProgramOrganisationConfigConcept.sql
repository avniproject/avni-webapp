CREATE TABLE program_organisation_config_at_risk_concept (
  id                             SERIAL PRIMARY KEY                              NOT NULL,
  program_organisation_config_id INT REFERENCES program_organisation_config (id) not null,
  concept_id                     INT REFERENCES concept (id)                     not null
);