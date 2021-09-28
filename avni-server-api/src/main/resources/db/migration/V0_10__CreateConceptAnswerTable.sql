CREATE TABLE concept_answer (
  id SERIAL PRIMARY KEY,
  concept_id BIGINT NOT NULL,
  answer_concept_id BIGINT NOT NULL,
  sort_weight DOUBLE PRECISION NOT NULL,
  uuid  CHARACTER VARYING(255) NOT NULL,
  version INTEGER NOT NULL,
  created_by_id  BIGINT NOT NULL,
  last_modified_by_id  BIGINT NOT NULL,
  created_date_time  TIMESTAMP  NOT NULL,
  last_modified_date_time TIMESTAMP NOT NULL
);

ALTER TABLE ONLY concept_answer
  ADD CONSTRAINT concept_answer_concept FOREIGN KEY (concept_id) REFERENCES concept (id);
ALTER TABLE ONLY concept_answer
  ADD CONSTRAINT concept_answer_answer_concept FOREIGN KEY (answer_concept_id) REFERENCES concept (id);
ALTER TABLE ONLY concept_answer
  ADD CONSTRAINT concept_answer_created_by_user FOREIGN KEY (created_by_id) REFERENCES users (id);
ALTER TABLE ONLY concept_answer
  ADD CONSTRAINT concept_answer_last_modified_by_user FOREIGN KEY (last_modified_by_id) REFERENCES users (id);
