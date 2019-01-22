alter table organisation add column media_directory text;
alter table organisation add UNIQUE (media_directory);

update public.organisation set media_directory = db_user;
