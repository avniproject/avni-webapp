CREATE TABLE catchment (
  id SERIAL PRIMARY KEY,
  name CHARACTER VARYING(255) NOT NULL,
  uuid  CHARACTER VARYING(255) NOT NULL,
  version INTEGER NOT NULL,
  created_by_id  BIGINT NOT NULL,
  last_modified_by_id  BIGINT NOT NULL,
  created_date_time  TIMESTAMP  NOT NULL,
  last_modified_date_time TIMESTAMP NOT NULL
);

ALTER TABLE ONLY catchment
  ADD CONSTRAINT catchment_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY catchment
  ADD CONSTRAINT catchment_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);


CREATE TABLE catchment_address_mapping (
  id SERIAL PRIMARY KEY,
  catchment_id BIGINT NOT NULL,
  addresslevel_id BIGINT NOT NULL,
  version       INTEGER NOT NULL,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

ALTER TABLE ONLY catchment_address_mapping
  ADD CONSTRAINT catchment_address_mapping_catchment FOREIGN KEY (catchment_id) REFERENCES catchment (id);
ALTER TABLE ONLY catchment_address_mapping
  ADD CONSTRAINT catchment_address_mapping_address FOREIGN KEY (addresslevel_id) REFERENCES address_level (id);
ALTER TABLE ONLY catchment_address_mapping
  ADD CONSTRAINT catchment_address_mapping_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY catchment_address_mapping
  ADD CONSTRAINT catchment_address_mapping_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);
