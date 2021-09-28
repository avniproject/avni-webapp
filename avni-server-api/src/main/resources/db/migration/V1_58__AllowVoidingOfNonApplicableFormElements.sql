alter table non_applicable_form_element
  add column is_voided BOOLEAN NOT NULL DEFAULT FALSE,
  add column version INTEGER NOT NULL default 0,
  add column audit_id INTEGER,
  add column uuid CHARACTER VARYING(255);

UPDATE non_applicable_form_element SET uuid = md5(random()::text || clock_timestamp()::text)::uuid WHERE uuid IS NULL;
INSERT INTO audit(uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, current_timestamp, current_timestamp FROM non_applicable_form_element);
UPDATE non_applicable_form_element SET audit_id = (SELECT id FROM audit WHERE audit.uuid = non_applicable_form_element.uuid);

ALTER TABLE non_applicable_form_element ADD CONSTRAINT non_applicable_form_element_audit FOREIGN KEY(audit_id) REFERENCES audit(id);
ALTER TABLE non_applicable_form_element ALTER COLUMN uuid SET NOT NULL;