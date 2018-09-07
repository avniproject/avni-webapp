CREATE OR REPLACE FUNCTION create_audit()
  RETURNS INTEGER AS $$
DECLARE result INTEGER;
BEGIN
  INSERT INTO audit(created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES(1,1, now(), now()) RETURNING id into result;
  RETURN result;
END $$
LANGUAGE plpgsql;

CREATE TABLE address_level_type (
  id                      SERIAL PRIMARY KEY,
  uuid                    CHARACTER VARYING(255) NOT NULL DEFAULT uuid_generate_v4(),
  name                    CHARACTER VARYING(255) NOT NULL,
  is_voided               BOOLEAN NOT NULL DEFAULT FALSE,
  organisation_id         INTEGER  NOT NULL,
  version                 INTEGER NOT NULL,
  audit_id                INTEGER
);

INSERT INTO address_level_type (name, organisation_id, version, audit_id)
SELECT type, organisation_id, 1, create_audit()
from address_level
group by type, organisation_id;
;

ALTER TABLE address_level ADD COLUMN type_id INTEGER REFERENCES address_level_type (id);

UPDATE address_level al SET type_id=(select alt.id from address_level_type alt where alt.name=al.type and alt.organisation_id=al.organisation_id);

alter table address_level DROP COLUMN type;