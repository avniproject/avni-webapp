CREATE TABLE facility (
  id                      SERIAL PRIMARY KEY,
  uuid          CHARACTER VARYING(255) NOT NULL,
  name                    CHARACTER VARYING(255) NOT NULL,
  address_id                 BIGINT,
  is_voided BOOLEAN NOT NULL DEFAULT FALSE,
  organisation_id INTEGER  NOT NULL,
  version INTEGER NOT NULL,
  audit_id   INTEGER
);
ALTER TABLE ONLY facility
  ADD CONSTRAINT facility_address FOREIGN KEY (address_id) REFERENCES address_level (id);