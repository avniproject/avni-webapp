create table dashboard_section (
  id              serial primary key,
  uuid            text                                     not null,
  name            text                                     null,
  description     text                                     null,
  dashboard_id    bigint                                   not null,
  view_type       text                                     not null,
  display_order   double precision default '-1' :: integer not null,
  is_voided       boolean                                  NOT NULL DEFAULT FALSE,
  version         integer,
  organisation_id bigint                                   not null,
  audit_id        bigint
);

ALTER TABLE ONLY dashboard_section
  ADD CONSTRAINT dashboard_section_organisation FOREIGN KEY (organisation_id) REFERENCES organisation (id),
  ADD CONSTRAINT dashboard_section_audit FOREIGN KEY (audit_id) REFERENCES audit (id),
  ADD CONSTRAINT dashboard_section_dashboard FOREIGN KEY (dashboard_id) REFERENCES dashboard (id),
  ADD CONSTRAINT dashboard_section_uuid_org_id_key unique (uuid, organisation_id),
  ADD CHECK ((name IS NOT NULL AND description IS NOT NULL) OR (view_type = 'Default'));

SELECT enable_rls_on_ref_table('dashboard_section');

insert into dashboard_section (uuid, dashboard_id, view_type, display_order, version, organisation_id, audit_id)
  select uuid_generate_v4(), t.dashboard_id, 'Default', 1, 0, t.organisation_id, create_audit()
  from (select dashboard_id, organisation_id, count(card_id) from dashboard_card_mapping group by 1, 2) as t;

create table dashboard_section_card_mapping (
  id                   serial primary key,
  uuid                 text                                     not null,
  dashboard_section_id bigint                                   not null,
  card_id              bigint                                   not null,
  display_order        double precision default '-1' :: integer not null,
  is_voided            boolean                                  NOT NULL DEFAULT FALSE,
  version              integer,
  organisation_id      bigint                                   not null,
  audit_id             bigint
);

ALTER TABLE ONLY dashboard_section_card_mapping
  ADD CONSTRAINT dashboard_section_card_mapping_organisation FOREIGN KEY (organisation_id) REFERENCES organisation (id),
  ADD CONSTRAINT dashboard_section_card_mapping_audit FOREIGN KEY (audit_id) REFERENCES audit (id),
  ADD CONSTRAINT dashboard_section_card_mapping_card FOREIGN KEY (card_id) REFERENCES report_card (id),
  ADD CONSTRAINT dashboard_section_card_mapping_dashboard FOREIGN KEY (dashboard_section_id) REFERENCES dashboard_section (id),
  ADD CONSTRAINT dashboard_section_card_mapping_uuid_org_id_key unique (uuid, organisation_id);

SELECT enable_rls_on_ref_table('dashboard_section_card_mapping');

insert into dashboard_section_card_mapping (uuid, dashboard_section_id, card_id, display_order, version, organisation_id, audit_id)
  select uuid_generate_v4(), ds.id, m.card_id, m.display_order, 0, ds.organisation_id, create_audit()
  from dashboard_section ds
         join dashboard_card_mapping m on m.organisation_id = ds.organisation_id
                      and m.dashboard_id = ds.dashboard_id;

-- drop table dashboard_card_mapping;
