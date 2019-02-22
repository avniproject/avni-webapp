
alter table address_level drop constraint address_level_unique_titel_level;
alter table address_level add constraint address_level_unique_title_level_org_id unique (title, level, organisation_id);
