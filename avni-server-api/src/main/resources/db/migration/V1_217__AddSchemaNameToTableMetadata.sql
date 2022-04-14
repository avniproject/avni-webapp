drop policy table_metadata_rls_policy on table_metadata;

alter table table_metadata drop column db_user;
alter table table_metadata add column schema_name text;

ALTER TABLE table_metadata
    DISABLE ROW LEVEL SECURITY;