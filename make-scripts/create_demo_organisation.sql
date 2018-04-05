CREATE ROLE demo
  NOINHERIT
  PASSWORD 'password';

GRANT demo TO openchs;

GRANT ALL ON ALL TABLES IN SCHEMA public TO demo;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO demo;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO demo;

INSERT INTO organisation (name, db_user, uuid, parent_organisation_id)
VALUES ('demo', 'demo', '4dafc869-2507-4946-9365-3a82c77fa122', 1);