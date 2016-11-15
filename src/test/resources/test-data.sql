delete from address_level;
INSERT INTO address_level (title, level, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) VALUES ('Nijhma', 1, 'ae35fe6d-910e-47bd-a0c7-0c10182a4085', 1, 1, 1, current_timestamp, current_timestamp);
INSERT INTO address_level (title, level, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) VALUES ('Naya Gaon', 1, 'a62d5ff9-4480-44f8-ab9f-9fe12e2e1a91', 1, 1, 1, current_timestamp, current_timestamp);

delete from individual;
INSERT INTO individual (uuid, address_id, catchment_id, version, date_of_birth, date_of_birth_estimated, name, gender_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time) VALUES ('4378dce3-247e-4393-8dd5-032c6eb0a655', 1, 1, 1, current_timestamp, FALSE, 'Prabhu', 2, 1, 1, current_timestamp, current_timestamp);