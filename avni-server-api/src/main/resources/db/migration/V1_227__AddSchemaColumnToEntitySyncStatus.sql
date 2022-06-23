alter table entity_sync_status
    add column schema_name text;

update entity_sync_status
set schema_name = db_user;

alter table entity_sync_status
    alter column schema_name set not null;
