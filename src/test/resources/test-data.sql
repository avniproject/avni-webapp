delete from encounter;
delete from program_encounter;
delete from program_enrolment;
delete from individual;
delete from address_level;
delete from program;
delete from encounter_type;
delete from followup_type;
delete from program_outcome;
delete from concept;
delete from form_element;
delete from form_element_group;
delete from form;

ALTER SEQUENCE concept_id_seq RESTART WITH 1;
INSERT INTO concept (name, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('Temperature', 'numeric', '95c4b174-6ce6-4d9a-b223-1f9000b60006', 1, 1, 1, current_timestamp, current_timestamp);

ALTER SEQUENCE program_outcome_id_seq RESTART WITH 1;
-- insert

ALTER SEQUENCE followup_type_id_seq RESTART WITH 1;
INSERT INTO followup_type (name, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('Sample Followup', '577f1454-ddfd-4d74-8f86-81c5207e04cc', 1, 1, 1, current_timestamp, current_timestamp);

ALTER SEQUENCE encounter_type_id_seq RESTART WITH 1;
INSERT INTO encounter_type (name, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('Sample Encounter Type', '3a1535d0-81fd-48fc-85b5-dc9da81064a3', 1, 1, 1, current_timestamp, current_timestamp);

ALTER SEQUENCE program_id_seq RESTART WITH 1;
INSERT INTO program (name, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('Diabetes', 'db62a322-0ec2-4bb0-ac24-296dc7216c9a', 1, 1, 1, current_timestamp, current_timestamp);

ALTER SEQUENCE address_level_id_seq RESTART WITH 1;
INSERT INTO address_level (title, level, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) VALUES ('Nijhma', 1, 'ae35fe6d-910e-47bd-a0c7-0c10182a4085', 1, 1, 1, current_timestamp, current_timestamp);
INSERT INTO address_level (title, level, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) VALUES ('Naya Gaon', 1, 'a62d5ff9-4480-44f8-ab9f-9fe12e2e1a91', 1, 1, 1, current_timestamp, current_timestamp);

ALTER SEQUENCE individual_id_seq RESTART WITH 1;
INSERT INTO individual (uuid, address_id, catchment_id, version, date_of_birth, date_of_birth_verified, name, gender_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('4378dce3-247e-4393-8dd5-032c6eb0a655', 1, 1, 1, current_timestamp, FALSE, 'Prabhu', 2, 1, 1, current_timestamp, current_timestamp);

ALTER SEQUENCE program_enrolment_id_seq RESTART WITH 1;
INSERT INTO program_enrolment (individual_id, program_id, enrolment_date_time, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1, 1, current_timestamp, 'ba0a3b91-2d4d-446b-a3ee-d56e7edaf3d3', 1, 1, 1, current_timestamp, current_timestamp);

ALTER SEQUENCE program_encounter_id_seq RESTART WITH 1;
INSERT INTO program_encounter (program_enrolment_id, followup_type_id, observations, actual_date_time, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1, 1, '[{"conceptUUID": "95c4b174-6ce6-4d9a-b223-1f9000b60006", "value": 98.9}]'::JSONB, current_timestamp, 'f5c3d56c-3d69-41bd-9e6a-52963adb6e76', 1, 1, 1, current_timestamp, current_timestamp);

ALTER SEQUENCE encounter_id_seq RESTART WITH 1;
INSERT INTO encounter (individual_id, encounter_type_id, observations, encounter_date_time, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1, 1, '[{"conceptUUID": "95c4b174-6ce6-4d9a-b223-1f9000b60006", "value": 98.9}]'::JSONB, current_timestamp, '63a7d615-b965-4830-9dd2-e8f533d9a4e9', 1, 1, 1, current_timestamp, current_timestamp);

INSERT INTO program (name, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('Nutrition', 'ac8cfbcb-39d2-4fcb-b02f-4ef80335f553', 1, 1, 1, current_timestamp, current_timestamp);

insert into individual (address_id, catchment_id, date_of_birth, date_of_birth_verified, name, gender_id, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1,1,'1950-09-17',FALSE, 'Ramesh Kumar', 2, '8d3d49af-f776-4cca-8413-ee571d9042fd', 1, 1, 1, current_timestamp, current_timestamp);

INSERT INTO program_enrolment (individual_id, program_id, enrolment_date_time, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 1, current_timestamp, '0ae41288-78c5-4ed4-af60-68d4ad2af1d0', 1, 1, 1, current_timestamp, current_timestamp);

INSERT INTO program_enrolment (individual_id, program_id, enrolment_date_time, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 2, current_timestamp, '529aa9ed-46bc-4530-9768-6ec941c0e2e0', 1, 1, 1, current_timestamp, current_timestamp);

insert into individual (address_id, catchment_id, date_of_birth, date_of_birth_verified, name, gender_id, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1,1,'1955-01-05',FALSE, 'Ram Kumari', 1, 'c415ef96-8ff9-4cbb-8407-e7618c90a055', 1, 1, 1, current_timestamp, current_timestamp);

ALTER SEQUENCE form_id_seq RESTART WITH 1;
insert into form (NAME, form_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('encounter_form' , 'encounter_type', '2c32a184-6d27-4c51-841d-551ca94594a5', 1, 1, 1, current_timestamp, current_timestamp);

ALTER SEQUENCE form_element_group_id_seq RESTART WITH 1;
insert into form_element_group (NAME, form_id, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('default_group',1, '4b317705-4372-4405-a628-6c8bb8da8671', 1, 1, 1, current_timestamp, current_timestamp);


insert into form_element (name, display_order, is_mandatory, concept_id, used_in_summary, is_generated, form_element_group_id, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('temp',1,true,1,false,false,1,'2f256e95-3011-4f42-8ebe-1c1af5e6b8d2', 1, 1, 1, current_timestamp, current_timestamp);

