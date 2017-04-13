ALTER TABLE form_element_group DROP CONSTRAINT form_element_group_form_id_display_order_key;
ALTER TABLE form_element DROP CONSTRAINT form_element_form_element_group_id_display_order_key;

ALTER TABLE form_element ADD UNIQUE (form_element_group_id, display_order) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE form_element_group ADD UNIQUE (form_id, display_order) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE concept_answer ADD UNIQUE (concept_id, answer_concept_id) DEFERRABLE INITIALLY DEFERRED;