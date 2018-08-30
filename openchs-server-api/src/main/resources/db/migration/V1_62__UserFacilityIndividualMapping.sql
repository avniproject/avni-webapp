create table user_facility_mapping (
  id              serial primary key,
  version         integer default 1,
  audit_id        bigint not null,
  uuid            varchar(255),
  is_voided       boolean not null default false,
  organisation_id bigint not null,
  facility_id     bigint not null,
  user_id         bigint not null
);

alter table only user_facility_mapping
  add constraint user_facility_mapping_facility foreign key (facility_id) references facility (id);
ALTER TABLE ONLY user_facility_mapping
  ADD CONSTRAINT user_facility_mapping_user FOREIGN KEY (user_id) REFERENCES users (id);

alter table individual add column facility_id bigint null;
ALTER TABLE ONLY individual
  ADD CONSTRAINT individual_facility FOREIGN KEY (facility_id) REFERENCES facility (id);
