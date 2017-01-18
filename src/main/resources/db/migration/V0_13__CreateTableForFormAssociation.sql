CREATE TABLE form_mapping (
  id SERIAL PRIMARY KEY,
  form_id BIGINT NOT NULL,
  related_entity JSONB NOT NULL,
  uuid          CHARACTER VARYING(255) NOT NULL,
  version       INTEGER NOT NULL,
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);

ALTER TABLE ONLY form_mapping
  ADD CONSTRAINT form_mapping_form FOREIGN KEY (form_id) REFERENCES form (id);
ALTER TABLE ONLY form_mapping
  ADD CONSTRAINT form_mapping_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY form_mapping
  ADD CONSTRAINT form_mapping_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);