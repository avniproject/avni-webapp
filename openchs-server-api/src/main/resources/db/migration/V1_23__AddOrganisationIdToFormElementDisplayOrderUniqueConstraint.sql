ALTER TABLE form_element_group DROP CONSTRAINT form_element_group_form_id_display_order_key;
ALTER TABLE form_element DROP CONSTRAINT form_element_form_element_group_id_display_order_key;

ALTER TABLE form_element ADD UNIQUE (form_element_group_id, display_order, organisation_id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE form_element_group ADD UNIQUE (form_id, display_order, organisation_id) DEFERRABLE INITIALLY DEFERRED;
