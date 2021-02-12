CREATE TABLE decision_concept (
  id         SERIAL PRIMARY KEY,
  concept_id BIGINT NOT NULL,
  form_id    BIGINT NOT NULL
);

ALTER TABLE ONLY decision_concept
  ADD CONSTRAINT decision_concept_form FOREIGN KEY (form_id) REFERENCES form (id);
ALTER TABLE ONLY decision_concept
  ADD CONSTRAINT decision_concept_concept FOREIGN KEY (concept_id) REFERENCES concept (id);
