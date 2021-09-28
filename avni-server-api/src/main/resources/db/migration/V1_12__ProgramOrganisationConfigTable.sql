CREATE TABLE program_organisation_config (
  id                      SERIAL PRIMARY KEY,
  uuid                    CHARACTER VARYING(255) NOT NULL UNIQUE,
  program_id              BIGINT                 NOT NULL REFERENCES program (id),
  organisation_id         BIGINT                 NOT NULL REFERENCES organisation (id),
  visit_schedule          JSONB                  NULL,
  version                 INTEGER                NOT NULL,
  created_by_id           BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time       TIMESTAMP              NOT NULL,
  last_modified_date_time TIMESTAMP              NOT NULL
);


ALTER TABLE program_organisation_config
  ADD CONSTRAINT program_organisation_unique_constraint UNIQUE (program_id, organisation_id);

CREATE POLICY program_organisation_config_org ON program_organisation_config USING (organisation_id IN (WITH RECURSIVE list_of_orgs(id, parent_organisation_id) AS ( SELECT id, parent_organisation_id FROM organisation WHERE db_user = current_user UNION ALL SELECT o.id, o.parent_organisation_id FROM organisation o, list_of_orgs log WHERE o.id = log.parent_organisation_id ) SELECT id FROM list_of_orgs)) WITH CHECK ( organisation_id IN (WITH RECURSIVE list_of_orgs(id, parent_organisation_id) AS (SELECT id, parent_organisation_id FROM organisation WHERE db_user = current_user UNION ALL SELECT o.id, o.parent_organisation_id FROM organisation o, list_of_orgs log WHERE o.id = log.parent_organisation_id ) SELECT id FROM list_of_orgs));