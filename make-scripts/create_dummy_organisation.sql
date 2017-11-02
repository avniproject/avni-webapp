INSERT INTO organisation (name, db_user, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES ('dummy', 'dummy', uuid_generate_v4(), 1, 1, 1, now(), now());

CREATE ROLE dummy NOINHERIT LOGIN PASSWORD 'password';

GRANT openchs TO dummy;

GRANT ALL ON ALL TABLES IN SCHEMA public TO dummy;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO dummy;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO dummy;