CREATE TABLE audit (
  id serial PRIMARY KEY NOT NULL,
  uuid VARCHAR(255),
  created_by_id     BIGINT                 NOT NULL,
  last_modified_by_id     BIGINT                 NOT NULL,
  created_date_time  TIMESTAMP                   NOT NULL,
  last_modified_date_time  TIMESTAMP                   NOT NULL
);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM address_level);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM catchment);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM checklist);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM checklist_item);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM concept);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM concept_answer);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM encounter);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM encounter_type);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM form);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM form_element);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM form_element_group);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM form_mapping);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM gender);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM individual);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM operational_encounter_type);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM operational_program);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM program);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM program_encounter);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM program_enrolment);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM program_organisation_config);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM program_outcome);
INSERT INTO audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) (SELECT uuid, 1, 1, now(), now() FROM users);

ALTER TABLE address_level  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE catchment  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE checklist  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE checklist_item  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE concept  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE concept_answer  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE encounter  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE encounter_type  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE form  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE form_element  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE form_element_group  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE form_mapping  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE gender  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE individual  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE operational_encounter_type  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE operational_program  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE program  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE program_encounter  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE program_enrolment  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE program_organisation_config  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE program_outcome  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;
ALTER TABLE users  DROP COLUMN created_by_id, DROP COLUMN last_modified_by_id, DROP COLUMN created_date_time, DROP COLUMN last_modified_date_time, ADD COLUMN audit_id INTEGER;

UPDATE address_level SET audit_id = (SELECT id FROM audit WHERE audit.uuid = address_level.uuid);
UPDATE catchment SET audit_id = (SELECT id FROM audit WHERE audit.uuid = catchment.uuid);
UPDATE checklist SET audit_id = (SELECT id FROM audit WHERE audit.uuid = checklist.uuid);
UPDATE checklist_item SET audit_id = (SELECT id FROM audit WHERE audit.uuid = checklist_item.uuid);
UPDATE concept SET audit_id = (SELECT id FROM audit WHERE audit.uuid = concept.uuid);
UPDATE concept_answer SET audit_id = (SELECT id FROM audit WHERE audit.uuid = concept_answer.uuid);
UPDATE encounter SET audit_id = (SELECT id FROM audit WHERE audit.uuid = encounter.uuid);
UPDATE encounter_type SET audit_id = (SELECT id FROM audit WHERE audit.uuid = encounter_type.uuid);
UPDATE form SET audit_id = (SELECT id FROM audit WHERE audit.uuid = form.uuid);
UPDATE form_element SET audit_id = (SELECT id FROM audit WHERE audit.uuid = form_element.uuid);
UPDATE form_element_group SET audit_id = (SELECT id FROM audit WHERE audit.uuid = form_element_group.uuid);
UPDATE form_mapping SET audit_id = (SELECT id FROM audit WHERE audit.uuid = form_mapping.uuid);
UPDATE gender SET audit_id = (SELECT id FROM audit WHERE audit.uuid = gender.uuid);
UPDATE individual SET audit_id = (SELECT id FROM audit WHERE audit.uuid = individual.uuid);
UPDATE operational_encounter_type SET audit_id = (SELECT id FROM audit WHERE audit.uuid = operational_encounter_type.uuid);
UPDATE operational_program SET audit_id = (SELECT id FROM audit WHERE audit.uuid = operational_program.uuid);
UPDATE program SET audit_id = (SELECT id FROM audit WHERE audit.uuid = program.uuid);
UPDATE program_encounter SET audit_id = (SELECT id FROM audit WHERE audit.uuid = program_encounter.uuid);
UPDATE program_enrolment SET audit_id = (SELECT id FROM audit WHERE audit.uuid = program_enrolment.uuid);
UPDATE program_organisation_config SET audit_id = (SELECT id FROM audit WHERE audit.uuid = program_organisation_config.uuid);
UPDATE program_outcome SET audit_id = (SELECT id FROM audit WHERE audit.uuid = program_outcome.uuid);
UPDATE users SET audit_id = (SELECT id FROM audit WHERE audit.uuid = users.uuid);