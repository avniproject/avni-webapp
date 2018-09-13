alter table users
  add column catchment_id int null,
  add column is_admin boolean not null default false,
  add column is_org_admin boolean null default false;
