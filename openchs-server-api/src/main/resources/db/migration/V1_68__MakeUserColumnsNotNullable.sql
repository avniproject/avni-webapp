alter table users
  alter column is_org_admin set not null,
  alter column organisation_id set not null;