CREATE TABLE checklist (
  id                      SERIAL PRIMARY KEY,
  name                    CHARACTER VARYING(255),
  program_enrolment_id    BIGINT                 NOT NULL,
  uuid                    CHARACTER VARYING(255) NOT NULL,
  version                 INTEGER                NOT NULL,
  created_by_id           BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time       TIMESTAMP              NOT NULL,
  last_modified_date_time TIMESTAMP              NOT NULL
);

ALTER TABLE ONLY checklist
  ADD CONSTRAINT checklist_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY checklist
  ADD CONSTRAINT checklist_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);

ALTER TABLE ONLY checklist
  ADD CONSTRAINT checklist_program_enrolment FOREIGN KEY (program_enrolment_id) REFERENCES program_enrolment (id);


CREATE TABLE checklist_item (
  id                      SERIAL PRIMARY KEY,
  due_date                TIMESTAMP              NOT NULL,
  max_date                TIMESTAMP              NULL,
  completion_date         TIMESTAMP              NULL,
  checklist_id            BIGINT                 NOT NULL,
  concept_id              BIGINT                 NOT NULL,
  uuid                    CHARACTER VARYING(255) NOT NULL,
  version                 INTEGER                NOT NULL,
  created_by_id           BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time       TIMESTAMP              NOT NULL,
  last_modified_date_time TIMESTAMP              NOT NULL
);

ALTER TABLE ONLY checklist_item
  ADD CONSTRAINT checklist_item_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY checklist_item
  ADD CONSTRAINT checklist_item_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);
ALTER TABLE ONLY checklist_item
  ADD CONSTRAINT checklist_item_concept FOREIGN KEY (concept_id) REFERENCES concept (id);
ALTER TABLE ONLY checklist_item
  ADD CONSTRAINT checklist_item_checklist FOREIGN KEY (checklist_id) REFERENCES checklist (id);
