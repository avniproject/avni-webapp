-- NOTE you have to put db_user twice, once in quotes
CREATE ROLE :db_user NOINHERIT NOLOGIN;

GRANT :db_user TO openchs;

GRANT ALL ON ALL TABLES IN SCHEMA public TO :db_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO :db_user;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO :db_user;


INSERT into organisation(name, db_user, uuid, parent_organisation_id, media_directory)
  SELECT '' || :org_name || ' Demo', :db_user_string, :uuid, :parent_organisation_id, :media_directory;
