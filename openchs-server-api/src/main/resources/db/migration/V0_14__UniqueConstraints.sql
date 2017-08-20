ALTER TABLE form_element ADD UNIQUE (form_element_group_id, display_order);
ALTER TABLE form_element_group ADD UNIQUE (form_id, display_order);

ALTER TABLE form_mapping ADD UNIQUE (uuid);
ALTER TABLE form ADD UNIQUE (uuid);
ALTER TABLE form_element_group ADD UNIQUE (uuid);
ALTER TABLE form_element ADD UNIQUE (uuid);
ALTER TABLE concept ADD UNIQUE (uuid);
ALTER TABLE concept_answer ADD UNIQUE (uuid);