alter table organisation add column schema_name varchar(255) null;
update organisation set schema_name = db_user;
alter table organisation alter column schema_name set not null;