CREATE ROLE dummy NOINHERIT LOGIN PASSWORD 'password';

GRANT openchs TO dummy;

GRANT ALL ON ALL TABLES IN SCHEMA public TO dummy;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO dummy;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO dummy;

INSERT INTO organisation (name, db_user, uuid)
VALUES ('dummy', 'dummy', '4dafc869-2507-4946-9365-3b82c77fa12d');