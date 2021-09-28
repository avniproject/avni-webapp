alter table users
  add column created_by_id BIGINT NOT NULL default 1;
alter table users
  add column last_modified_by_id BIGINT NOT NULL default 1;
alter table users
  add column created_date_time TIMESTAMP NOT NULL default current_timestamp;
alter table users
  add column last_modified_date_time TIMESTAMP NOT NULL default current_timestamp;
