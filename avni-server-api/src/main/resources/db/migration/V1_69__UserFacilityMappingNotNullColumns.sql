alter table user_facility_mapping
  alter column uuid set not null,
  alter column version set not null;