DELETE FROM non_applicable_form_element;
DELETE FROM form_element;
DELETE FROM form_element_group;
DELETE FROM form_mapping;
DELETE FROM form;
DELETE FROM encounter;
DELETE FROM program_encounter;
DELETE FROM program_enrolment;
DELETE FROM subject_migration;
DELETE FROM individual;
DELETE FROM program;
DELETE FROM encounter_type;
DELETE FROM program_outcome;
DELETE FROM concept_answer;
DELETE FROM answer_concept_migration;
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
DELETE FROM user_group;
DELETE FROM external_system_config;
DELETE FROM organisation_config;
DELETE from message_request_queue;
DELETE from message_receiver;
DELETE from message_rule;
DELETE FROM users;
DELETE FROM subject_type;
DELETE FROM groups;
DELETE FROM group_privilege;
DELETE FROM organisation;
DELETE FROM audit;

ALTER SEQUENCE non_applicable_form_element_id_seq RESTART WITH 1;
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
ALTER SEQUENCE audit_id_seq RESTART WITH 1;
ALTER SEQUENCE external_system_config_id_seq RESTART WITH 1;
ALTER SEQUENCE message_receiver_id_seq RESTART WITH 1;
ALTER SEQUENCE message_request_queue_id_seq RESTART WITH 1;
ALTER SEQUENCE message_rule_id_seq RESTART WITH 1;

INSERT into organisation(id, name, db_user, uuid, media_directory, parent_organisation_id, schema_name)
values (1, 'OpenCHS', 'openchs', '3539a906-dfae-4ec3-8fbb-1b08f35c3884', 'openchs_impl', null, 'openchs')
ON CONFLICT (uuid) DO NOTHING;

select create_db_user('demo', 'password');

INSERT INTO organisation(id, name, db_user, media_directory, uuid, parent_organisation_id, schema_name)
VALUES (2, 'demo', 'demo', 'demo', 'ae0e4ac4-681d-45f2-8bdd-2b09a5a1a6e5', 1, 'demo')
ON CONFLICT (uuid) DO NOTHING;

insert into organisation_config (uuid, organisation_id, settings, version, is_voided, worklist_updation_rule, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
values ('5bd9c67e-c949-4872-9763-daeab7b48b1b', 1, '{"enableMessaging": true}', 0, false, '', 1, 1, now(), now());

select create_db_user('a_demo', 'password');

INSERT INTO organisation (id, name, db_user, media_directory, uuid, parent_organisation_id, schema_name)
VALUES (3, 'a-demo', 'a_demo', 'a-demo', '2734f2ba-610b-49f8-b8d3-4196a460e325', 1, 'a_demo')
ON CONFLICT (uuid) DO NOTHING;

insert into subject_type(id, uuid, name, organisation_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1, '9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3', 'Individual', 1, 1, 1, now(), now());

INSERT INTO users (id, username, uuid, organisation_id, operating_individual_scope, is_org_admin)
VALUES (1, 'admin', '5fed2907-df3a-4867-aef5-c87f4c78a31a', 1, 'None', false);
INSERT INTO users (id, username, uuid, organisation_id, operating_individual_scope, is_org_admin)
VALUES (2, 'demo-admin', '0e53a72c-a109-49f2-918c-9599b266a585', 2, 'None', true);
INSERT INTO users (id, username, uuid, organisation_id, operating_individual_scope, is_org_admin)
VALUES (3, 'a-demo-admin', 'd84df3cf-cdb4-4309-ad91-e0402f6e326a', 3, 'None', true);

INSERT INTO catchment (id, name, uuid, version, organisation_id, type, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES
(1, 'CatchmentX', '1722e2d4-3ef3-4ea0-a4c8-72090504ec7f', 0, 1, 'TypeX', 1, 1, now(), now());

INSERT INTO catchment (id, name, uuid, version, organisation_id, type, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES  (2, 'CatchmentY', 'b95cf900-6740-4696-95a1-219db2a8bdcb', 0, 2, 'TypeY', 1, 1, now(), now());
INSERT INTO users (id, username, uuid, organisation_id, operating_individual_scope, is_org_admin, catchment_id)
VALUES (4, 'demo-user', 'f10b5e79-30ef-45ce-a1f5-f1a5101d7c7f', 2, 'ByCatchment', false, 2);

INSERT INTO users (id, username, uuid, organisation_id, operating_individual_scope, is_org_admin, catchment_id)
VALUES (5, 'demo-user-2', '55ef8e34-d1a3-44c9-b750-a791b09bb369', 2, 'ByCatchment', false, 1);

INSERT INTO gender (id, name, uuid, version, organisation_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1, 'Female', 'ad7d1d14-54fd-45a2-86b7-ea329b744484', 1, 1, 1, 1, now(), now());
INSERT INTO gender (id, name, uuid, version, organisation_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 'Male', '840de9fb-e565-4d7d-b751-90335ba20490', 1, 1, 1, 1, now(), now());
INSERT INTO gender (id, name, uuid, version, organisation_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (3, 'Other', '188ad77e-fe46-4328-b0e2-98f3a05c554c', 1, 1, 1, 1, now(), now());

INSERT INTO concept (id, name, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES
(1, 'Temperature', 'Numeric', '95c4b174-6ce6-4d9a-b223-1f9000b60006', 1, 1, 1, now(), now());

/* muliselect */
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 'Complaint', 'Coded', '9daa0b8a-985a-464d-a5ab-8a4f90e8a26b', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (3, 'Fever', 'N/A', 'd2e35080-ec9b-46f6-bf8c-7087fcf0ecfd', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (4, 'Vomiting', 'N/A', '627c8cbc-a03d-4e3f-9e4d-7059e60f3225', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (5, 'Chloroquine Resistant', 'N/A', '9d9e3cab-3a45-4f85-bc19-2d2d736bb17a', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (6, 'Cough', 'N/A', '002173d4-2f59-4a6c-b315-049ecdb7cf68', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (7, 'Bodyache', 'N/A', '6c9cd213-0822-42d5-8ef3-47f0da1738f9', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (8, 'Cold', 'N/A', '7eae07be-a340-4ced-ac8d-c910cf91a672', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (9, 'Headache', 'N/A', '5f14ae60-1ae4-4d1e-ae10-d312d47e529a', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (10, 'Acidity', 'N/A', '637c8ae1-f6a8-45f7-bd8f-10964632c05a', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (11, 'Giddyness', 'N/A', 'f9498304-50a8-4725-8071-04f623ddacf4', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (12, 'Abdominal Pain', 'N/A', 'db848b92-dda9-4510-988e-a06b71acbaf5', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (13, 'Diarrhoea', 'N/A', 'e491b590-2f34-4fb7-8b46-7e533a9903f1', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (14, 'Pregnancy', 'N/A', '74a4ed09-f9a9-4647-8e48-a00432a65c35', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (15, 'Wound', 'N/A', '18e30591-41e0-4da0-9e78-ee52c6f6c4fe', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (16, 'Scabies', 'N/A', '57e2e29f-9691-4f2d-a4db-4df4a17a9255', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (17, 'Ringworm', 'N/A', '122cb9cb-3fdc-48e7-a68f-682c5e744c22', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (18, 'Boils', 'N/A', 'aee32344-0ea0-4833-9387-2cb21586f1a9', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, key_values, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (19, 'Phone Number', 'Text', '[{"key": "contact_number", "value": "yes"}]', '7c39cb04-4f02-4c49-8f94-a5b697d40365', 1, 1, 1, now(), now());

INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 3, 1, '00828291-c2fe-415f-a51e-ba8a02607da0', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 4, 2, '85841889-9676-40e7-a587-9da9d05bb89b', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 5, 3, '3cd01910-bd15-45ff-aec8-392ec11f2357', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 6, 4, '3ec9b9e6-355b-4db1-bb4e-92db6d14edc5', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 7, 5, '6a29ed8e-d5aa-4581-b5da-d650fa1b51ff', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 8, 6, '8cab0a2a-d47f-44f7-9727-f7cf52687b8d', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 9, 7, '5c2a8604-1abf-4091-9023-b7b18db54a60', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 10, 8, '180d05cf-35ea-42ca-a1c0-9345424cf14c', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 11, 9, 'e94fa8a5-1f12-40b9-9b95-075a83c45901', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 12, 10, '2a394f0e-03b0-44cf-9199-29e31da84e3b', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 13, 11, '539d046c-3381-4068-a853-1915f5270d78', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 14, 12, '2a0e7e1c-620a-4ca0-b46e-21db36a5ff4d', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 15, 13, '7c0fd5bd-c8ef-4f09-a5df-dc0bf4aaba67', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 16, 14, '81bf9fb9-a19b-415e-a9fe-fbef9d17ada0', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 17, 15, 'eb592ded-2467-4d32-a48d-deb4916cda31', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 18, 16, 'a9ca3096-6f4d-4af2-8b91-9cf87f5d4d13', 1, 1, 1, now(), now());

/* single select */
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES
(20, 'Paracheck', 'Coded', '405f25bb-4553-4b7c-b6bc-a44082ef576f', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (21, 'Negative', 'N/A', '782d6227-b815-4fed-aef1-52354e1dcf77', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES
(22, 'Positive for PV', 'N/A', '3bdd6dfe-1113-4930-90df-a20cff9ea0f4', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES
(23, 'Positive for PF', 'N/A', '6c71b496-7df2-4ee2-afa7-248d622b9760', 1, 1, 1, now(), now());
INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (24, 'Positive for PV and PF', 'N/A', '0d6f3dbd-c758-4b03-aa45-fd40699d6138', 1, 1, 1, now(), now());

INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (20, 20, 1, '2e91c2ea-ca5f-4674-b98b-9c0f8cb48069', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (20, 21, 2, '0a4d1804-7404-4f29-be18-eaff80c3d503', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (20, 22, 3, '676c358d-0d21-46cf-bb38-c3a5bfb5ead1', 1, 1, 1, now(), now());
INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (20, 23, 4, '7dc1c6db-419b-483d-8b47-0d2b89d9919b', 1, 1, 1, now(), now());

INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (25, 'Some random concept', 'N/A', '6f83d3e4-0e25-4f51-8b5e-5421322f3ffe', 1, 1, 1, now(), now());

INSERT INTO concept (id, NAME, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (26, 'Some random concept for voided ConceptAnswer', 'N/A', '766eb773-942e-4874-819d-29039d6794b9', 1, 1, 1, now(), now());

INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, is_voided, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 26, 100, '734f93e8-0bd8-4457-bdbe-e3514a2600ea', 1, true, 1, 1, now(), now());

INSERT INTO encounter_type (name, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('Sample Encounter Type', '3a1535d0-81fd-48fc-85b5-dc9da81064a3', 1, 1, 1, now(), now());

INSERT INTO program (name, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('Diabetes', 'db62a322-0ec2-4bb0-ac24-296dc7216c9a', 1, 1, 1, now(), now());

INSERT INTO address_level (id, title, uuid, version, lineage, parent_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1, 'Nijhma', 'ae35fe6d-910e-47bd-a0c7-0c10182a4085', 1, '1', NULL, 1, 1, now(), now());
INSERT INTO address_level (id, title, uuid, version, lineage, parent_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 'Naya Gaon', 'a62d5ff9-4480-44f8-ab9f-9fe12e2e1a91', 1, '2', NULL, 1, 1, now(), now());

INSERT INTO catchment_address_mapping (catchment_id, addresslevel_id)
VALUES (1, 1), (1, 2), (2, 2);

INSERT INTO individual (uuid, address_id, version, date_of_birth, date_of_birth_verified, first_name, last_name, gender_id, organisation_id,
                        subject_type_id, observations, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('4378dce3-247e-4393-8dd5-032c6eb0a655', 1, 1, current_timestamp, FALSE, 'Prabhu', 'Kumar', 2, 2,
        (select id from subject_type where name = 'Individual'), '{"7c39cb04-4f02-4c49-8f94-a5b697d40365": "9282738493"}'::jsonb, 1, 1, now(), now());

INSERT INTO individual (uuid, address_id, version, date_of_birth, date_of_birth_verified, first_name, last_name, gender_id, organisation_id,
                        subject_type_id, observations, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('5378dce3-247e-4393-8dd5-032c6eb0a655', 1, 1, current_timestamp, FALSE, 'Prabhu', 'Kumar', 2, 2,
        (select id from subject_type where name = 'Individual'), '{}'::jsonb, 1, 1, now(), now());


INSERT INTO program_enrolment (individual_id, program_id, enrolment_date_time, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time, address_id)
VALUES (1, 1, current_timestamp, 'ba0a3b91-2d4d-446b-a3ee-d56e7edaf3d3', 1, 1, 1, now(), now(), 1);

INSERT INTO program_encounter (program_enrolment_id, encounter_type_id, observations, encounter_date_time, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time, individual_id, address_id)
VALUES (1, 1, '{"95c4b174-6ce6-4d9a-b223-1f9000b60006":98.9}' :: JSONB, current_timestamp, 'f5c3d56c-3d69-41bd-9e6a-52963adb6e76', 1, 1, 1, now(), now(), 1, 1);

INSERT INTO encounter (individual_id, encounter_type_id, observations, encounter_date_time, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time, address_id)
VALUES (1, 1, '
{
  "conceptUUID": "95c4b174-6ce6-4d9a-b223-1f9000b60006",
  "valuePrimitive": 98.9
}
' :: JSONB, current_timestamp, '63a7d615-b965-4830-9dd2-e8f533d9a4e9', 1, 1, 1, now(), now(), 1);

INSERT INTO program (name, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('Nutrition', 'ac8cfbcb-39d2-4fcb-b02f-4ef80335f553', 1, 1, 1, now(), now());

INSERT INTO individual (address_id, date_of_birth, date_of_birth_verified, first_name, last_name, gender_id, uuid, version,
                        subject_type_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES
(1, '1950-09-17', FALSE, 'Ramesh', 'Kumar', 2, '8d3d49af-f776-4cca-8413-ee571d9042fd', 1,
 (select id from subject_type where name = 'Individual'), 1, 1, now(), now());

INSERT INTO program_enrolment (individual_id, program_id, enrolment_date_time, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time, address_id)
VALUES (2, 1, current_timestamp, '0ae41288-78c5-4ed4-af60-68d4ad2af1d0', 1, 1, 1, now(), now(), 1);

INSERT INTO program_enrolment (individual_id, program_id, enrolment_date_time, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time, address_id)
VALUES (2, 2, current_timestamp, '529aa9ed-46bc-4530-9768-6ec941c0e2e0', 1, 1, 1, now(), now(), 1);

INSERT INTO individual (address_id, date_of_birth, date_of_birth_verified, first_name, last_name, gender_id, uuid, version,
                        subject_type_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1, '1955-01-05', FALSE, 'Ram', 'Kumari', 1, 'c415ef96-8ff9-4cbb-8407-e7618c90a055', 1,
        (select id from subject_type where name = 'Individual'), 1, 1, now(), now());

INSERT INTO individual (address_id, date_of_birth, date_of_birth_verified, first_name, last_name, gender_id, uuid, version,
                        subject_type_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, '1955-01-05', FALSE, 'Ram', 'Kumari', 1, 'bb312ece-5e2e-490f-ae1d-2896089da81e', 1,
        (select id from subject_type where name = 'Individual'), 1, 1, now(), now());

INSERT INTO form (NAME, form_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('encounter_form', 'Encounter', '2c32a184-6d27-4c51-841d-551ca94594a5', 1, 1, 1, now(), now());


INSERT INTO audit (created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1, 1, now(), now());

UPDATE form
SET audit_id = (SELECT currval('audit_id_seq'));

INSERT INTO form_element_group (NAME, form_id, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('default_group', 1, '4b317705-4372-4405-a628-6c8bb8da8671', 1, 1, 1, now(), now());

INSERT INTO audit (id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1001, 1, 1, now() - INTERVAL '1 year', now() - INTERVAL '1 year');

INSERT INTO audit (id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1002, 1, 1, now() - INTERVAL '1 year', now() - INTERVAL '1 year');

INSERT INTO audit (id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1003, 1, 1, now() - INTERVAL '1 year', now() - INTERVAL '1 year');

INSERT INTO form_element (name, display_order, is_mandatory, concept_id, form_element_group_id, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES
('Complaint', 2, TRUE, 2, 1, '2f256e95-3011-4f42-8ebe-1c1af5e6b8d2', 1, 1, 1, now(), now());

INSERT INTO form_element (name, display_order, is_mandatory, concept_id, form_element_group_id, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES
('Temperature', 1, TRUE, 1, 1, '2b2e9964-d942-4f83-a296-1096db2c2f0b', 1, 1, 1, now(), now());

INSERT INTO form_element (name, display_order, is_mandatory, concept_id, form_element_group_id, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES
('Paracheck', 3, TRUE, 19, 1, 'b6edbb87-22d8-4265-9231-aad499475d0c', 1, 1, 1, now(), now());

INSERT INTO form_mapping (form_id, entity_id, uuid, version, subject_type_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1, 1, '741cbb1f-f1bf-42f2-87f7-f5258aa91647', 0, 1, 1, 1, now(), now());

INSERT INTO external_system_config (organisation_id, version, created_by_id, last_modified_by_id, created_date_time,
                                    last_modified_date_time, system_name, config)
values (3, 0, 3, 3, now(), now(), 'Glific', '{"baseUrl": "http://localhost:9191", "phone": "919693847573", "password": "seecretpass"}');

insert into message_rule (id, uuid, name, message_rule, schedule_rule, entity_type, entity_type_id, message_template_id, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time, organisation_id)
values (1, '15e766d8-3d8b-4777-8f55-1b171ac9872d', 'Individual message rule', null, '() => ([1, 2, 3])', 'Subject', (select id from subject_type where name = 'Individual'), 1, 0, 1, 2, now(), now(), 1);

insert into message_receiver(id, uuid, receiver_type, receiver_id, organisation_id, is_voided, external_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time, version)
values (1, 'c48d7ae7-d0a9-4f79-aede-19297db736f9', 'Subject', (select id from individual where uuid = '4378dce3-247e-4393-8dd5-032c6eb0a655'), 1, false, '1', 1, 1, now(), now(), 1);

insert into message_request_queue(uuid, organisation_id, message_rule_id, message_receiver_id, scheduled_date_time, delivered_date_time, delivery_status, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time, version, entity_id)
values ('75925823-109f-41a5-89e3-9c719c88155d', 1, 1, 1, now(), null, 'NotSent', 1, 1, now(), now(), 0, (select id from individual where uuid = '4378dce3-247e-4393-8dd5-032c6eb0a655'));

insert into message_request_queue(uuid, organisation_id, message_rule_id, message_receiver_id, scheduled_date_time, delivered_date_time, delivery_status, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time, version, entity_id)
values ('647bb6bb-99f1-4921-809e-26f2c730fc09', 1, 1, 1, now(), now(), 'Sent', 1, 1, now(), now(), 0, (select id from individual where uuid = '4378dce3-247e-4393-8dd5-032c6eb0a655'));

SELECT setval('non_applicable_form_element_id_seq', COALESCE((SELECT MAX(id) + 1
                                                              FROM non_applicable_form_element), 1), FALSE);
SELECT setval('catchment_id_seq', COALESCE((SELECT MAX(id) + 1
                                            FROM catchment), 1), FALSE);
SELECT setval('organisation_id_seq', COALESCE((SELECT MAX(id) + 1
                                               FROM organisation), 1), FALSE);
SELECT setval('form_element_id_seq', COALESCE((SELECT MAX(id) + 1
                                               FROM form_element), 1), FALSE);
SELECT setval('form_element_group_id_seq', COALESCE((SELECT MAX(id) + 1
                                                     FROM form_element_group), 1), FALSE);
SELECT setval('form_mapping_id_seq', COALESCE((SELECT MAX(id) + 1
                                               FROM form_mapping), 1), FALSE);
SELECT setval('form_id_seq', COALESCE((SELECT MAX(id) + 1
                                       FROM form), 1), FALSE);
SELECT setval('encounter_id_seq', COALESCE((SELECT MAX(id) + 1
                                            FROM encounter), 1), FALSE);
SELECT setval('program_encounter_id_seq', COALESCE((SELECT MAX(id) + 1
                                                    FROM program_encounter), 1), FALSE);
SELECT setval('program_enrolment_id_seq', COALESCE((SELECT MAX(id) + 1
                                                    FROM program_enrolment), 1), FALSE);
SELECT setval('individual_id_seq', COALESCE((SELECT MAX(id) + 1
                                             FROM individual), 1), FALSE);
SELECT setval('program_id_seq', COALESCE((SELECT MAX(id) + 1
                                          FROM program), 1), FALSE);
SELECT setval('encounter_type_id_seq', COALESCE((SELECT MAX(id) + 1
                                                 FROM encounter_type), 1), FALSE);
SELECT setval('program_outcome_id_seq', COALESCE((SELECT MAX(id) + 1
                                                  FROM program_outcome), 1), FALSE);
SELECT setval('concept_answer_id_seq', COALESCE((SELECT MAX(id) + 1
                                                 FROM concept_answer), 1), FALSE);
SELECT setval('concept_id_seq', COALESCE((SELECT MAX(id) + 1
                                          FROM concept), 1), FALSE);
SELECT setval('gender_id_seq', COALESCE((SELECT MAX(id) + 1
                                         FROM gender), 1), FALSE);
SELECT setval('catchment_address_mapping_id_seq', COALESCE((SELECT MAX(id) + 1
                                                            FROM catchment_address_mapping), 1), FALSE);
SELECT setval('address_level_id_seq', COALESCE((SELECT MAX(id) + 1
                                                FROM address_level), 1), FALSE);
SELECT setval('catchment_id_seq', COALESCE((SELECT MAX(id) + 1
                                            FROM catchment), 1), FALSE);
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) + 1
                                        FROM users), 1), FALSE);

SELECT setval('audit_id_seq', COALESCE((SELECT MAX(id) + 1
                                        FROM audit), 1), FALSE);

SELECT setval('external_system_config_id_seq', COALESCE((SELECT MAX(id) + 1
                                        FROM external_system_config), 1), FALSE);
