CREATE TABLE checklist_detail (
  id              SMALLSERIAL PRIMARY KEY,
  uuid            CHARACTER VARYING(255) UNIQUE NOT NULL,
  version         INTEGER                       NOT NULL,
  audit_id        INTEGER                       NOT NULL,
  name            VARCHAR                       NOT NULL,
  is_voided       BOOLEAN                       NOT NULL DEFAULT FALSE,
  organisation_id INTEGER                       NOT NULL REFERENCES organisation (id)
);

CREATE TABLE checklist_item_detail (
  id                  SMALLSERIAL PRIMARY KEY,
  uuid                CHARACTER VARYING(255) UNIQUE NOT NULL,
  version             INTEGER                       NOT NULL,
  audit_id            INTEGER                       NOT NULL REFERENCES audit (id),
  form_id             INTEGER                       NOT NULL REFERENCES form (id),
  concept_id          INTEGER                       NOT NULL REFERENCES concept (id),
  checklist_detail_id INTEGER                       NOT NULL REFERENCES checklist_detail (id),
  status              JSONB                         NOT NULL DEFAULT '{}' :: JSONB,
  is_voided           BOOLEAN                       NOT NULL DEFAULT FALSE,
  organisation_id     INTEGER                       NOT NULL REFERENCES organisation (id)
);


ALTER TABLE checklist_item
  DROP COLUMN form_id;
ALTER TABLE checklist_item
  DROP COLUMN status;
ALTER TABLE checklist_item
  DROP COLUMN concept_id;
ALTER TABLE checklist_item
  ADD COLUMN checklist_item_detail_id INTEGER REFERENCES checklist_item_detail (id);

ALTER TABLE checklist
  ADD COLUMN checklist_detail_id INTEGER REFERENCES checklist_detail (id);

ALTER TABLE checklist
  DROP COLUMN name;