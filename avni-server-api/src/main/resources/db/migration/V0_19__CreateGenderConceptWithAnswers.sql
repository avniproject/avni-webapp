INSERT INTO concept (name, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('Gender', 'Coded', '483be0b2-b6ba-40e0-8bf7-91cb33c6e284', 1, 1, 1, current_timestamp, current_timestamp);

INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ((SELECT id from concept where name = 'Gender'), (SELECT id from concept where name = 'Male'), 1, 'fd630fa3-7122-40b5-9a4c-12bfe7a314e0', 1, 1, 1, current_timestamp, current_timestamp);

INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ((SELECT id from concept where name = 'Gender'), (SELECT id from concept where name = 'Female'), 1, 'f6532996-a377-48f4-aafc-2e044ad9b1e2', 1, 1, 1, current_timestamp, current_timestamp);

INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ((SELECT id from concept where name = 'Gender'), (SELECT id from concept where name = 'Other Gender'), 1, 'e033664f-458c-4698-8090-152ee7fb4cd7', 1, 1, 1, current_timestamp, current_timestamp);