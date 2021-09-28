CREATE TABLE form (
  id                      SERIAL PRIMARY KEY,
  name                    CHARACTER VARYING(255) NOT NULL,
  form_type               CHARACTER VARYING(255) NOT NULL,
  uuid                    CHARACTER VARYING(255) NOT NULL,
  version                 INTEGER                NOT NULL,
  created_by_id           BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time       TIMESTAMP              NOT NULL,
  last_modified_date_time TIMESTAMP              NOT NULL
);

ALTER TABLE ONLY form
  ADD CONSTRAINT form_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY form
  ADD CONSTRAINT form_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);
------
CREATE TABLE form_element_group (
  id                      SERIAL PRIMARY KEY,
  name                    CHARACTER VARYING(255) NOT NULL,
  form_id                 BIGINT                 NOT NULL,
  uuid                    CHARACTER VARYING(255) NOT NULL,
  version                 INTEGER                NOT NULL,
  created_by_id           BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time       TIMESTAMP              NOT NULL,
  last_modified_date_time TIMESTAMP              NOT NULL
);

ALTER TABLE ONLY form_element_group
  ADD CONSTRAINT form_element_group_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY form_element_group
  ADD CONSTRAINT form_element_group_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);
ALTER TABLE ONLY form_element_group
  ADD CONSTRAINT form_element_group_form FOREIGN KEY (form_id) REFERENCES form (id);
-----
CREATE TABLE form_element (
  id                      SERIAL PRIMARY KEY,
  name                    CHARACTER VARYING(255) NOT NULL,
  display_order           SMALLINT               NOT NULL,
  is_mandatory            BOOLEAN                NOT NULL DEFAULT FALSE,
  key_values              JSONB                  NULL,
  concept_id              BIGINT                 NOT NULL,
  used_in_summary         BOOLEAN                NOT NULL DEFAULT FALSE,
  is_generated            BOOLEAN                NOT NULL DEFAULT FALSE,
  form_element_group_id           BIGINT                 NOT NULL,
  uuid                    CHARACTER VARYING(255) NOT NULL,
  version                 INTEGER                NOT NULL,
  created_by_id           BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time       TIMESTAMP              NOT NULL,
  last_modified_date_time TIMESTAMP              NOT NULL
);

ALTER TABLE ONLY form_element
  ADD CONSTRAINT form_element_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY form_element
  ADD CONSTRAINT form_element_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);
ALTER TABLE ONLY form_element
  ADD CONSTRAINT form_element_concept FOREIGN KEY (concept_id) REFERENCES concept (id);
ALTER TABLE ONLY form_element
  ADD CONSTRAINT form_element_form_element_group FOREIGN KEY (form_element_group_id) REFERENCES form_element_group (id);

