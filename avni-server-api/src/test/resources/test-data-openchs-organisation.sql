DELETE FROM form_element;
DELETE FROM form_element_group;
DELETE FROM form_mapping;
DELETE FROM form;
DELETE FROM encounter;
DELETE FROM program_encounter;
DELETE FROM program_enrolment;
DELETE FROM individual;
DELETE FROM program;
DELETE FROM encounter_type;
DELETE FROM program_outcome;
DELETE FROM concept_answer;
DELETE FROM concept;
DELETE FROM individual_relationship;
DELETE FROM individual_relationship_type;
DELETE FROM individual_relation_gender_mapping;
DELETE FROM individual_relation;
DELETE FROM gender;
DELETE FROM catchment_address_mapping;
DELETE FROM address_level;
DELETE FROM catchment;
DELETE FROM account_admin;
delete from user_group;
DELETE FROM external_system_config;
DELETE FROM users;
DELETE FROM subject_type;
DELETE FROM groups;
DELETE FROM group_privilege;
DELETE FROM organisation;

ALTER SEQUENCE form_element_id_seq RESTART WITH 1;
ALTER SEQUENCE form_element_group_id_seq RESTART WITH 1;
ALTER SEQUENCE form_mapping_id_seq RESTART WITH 1;
ALTER SEQUENCE form_id_seq RESTART WITH 1;
ALTER SEQUENCE encounter_id_seq RESTART WITH 1;
ALTER SEQUENCE program_encounter_id_seq RESTART WITH 1;
ALTER SEQUENCE program_enrolment_id_seq RESTART WITH 1;
ALTER SEQUENCE individual_id_seq RESTART WITH 1;
ALTER SEQUENCE program_id_seq RESTART WITH 1;
ALTER SEQUENCE encounter_type_id_seq RESTART WITH 1;
ALTER SEQUENCE program_outcome_id_seq RESTART WITH 1;
ALTER SEQUENCE concept_answer_id_seq RESTART WITH 1;
ALTER SEQUENCE concept_id_seq RESTART WITH 1;
ALTER SEQUENCE gender_id_seq RESTART WITH 1;
ALTER SEQUENCE catchment_address_mapping_id_seq RESTART WITH 1;
ALTER SEQUENCE address_level_id_seq RESTART WITH 1;
ALTER SEQUENCE catchment_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE organisation_id_seq RESTART WITH 1;
ALTER SEQUENCE individual_relation_id_seq RESTART WITH 1;
ALTER SEQUENCE individual_relation_gender_mapping_id_seq RESTART WITH 1;
ALTER SEQUENCE individual_relationship_type_id_seq RESTART WITH 1;
ALTER SEQUENCE individual_relationship_id_seq RESTART WITH 1;

INSERT INTO organisation (id, name, db_user, media_directory, uuid, schema_name)
VALUES (1, 'OpenCHS', 'openchs', 'openchs_impl', '3539a906-dfae-4ec3-8fbb-1b08f35c3884', 'openchs');

INSERT INTO users (id, username, uuid, organisation_id, operating_individual_scope)
VALUES (1, 'admin', '5fed2907-df3a-4867-aef5-c87f4c78a31a', 1, 'None');
