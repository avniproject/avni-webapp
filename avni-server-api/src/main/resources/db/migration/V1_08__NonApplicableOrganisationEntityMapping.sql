CREATE TABLE non_applicable_form_element (
  id              SERIAL PRIMARY KEY,
  organisation_id BIGINT REFERENCES organisation (id),
  form_element_id BIGINT REFERENCES form_element (id)
);