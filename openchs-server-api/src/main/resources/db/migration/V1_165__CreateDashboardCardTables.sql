create table card
(
    id              serial primary key,
    uuid            varchar(255) not null,
    name            varchar(255) not null,
    query           text         not null,
    description     text,
    colour          varchar(20),
    is_voided       boolean      NOT NULL DEFAULT FALSE,
    version         integer,
    organisation_id integer      not null,
    audit_id        integer
);

ALTER TABLE ONLY card
    ADD CONSTRAINT card_organisation FOREIGN KEY (organisation_id) REFERENCES organisation (id),
    ADD CONSTRAINT card_master_audit FOREIGN KEY (audit_id) REFERENCES audit (id),
    ADD CONSTRAINT card_uuid_org_id_key unique (uuid, organisation_id);

SELECT enable_rls_on_ref_table('card');

create table dashboard
(
    id              serial primary key,
    uuid            varchar(255) not null,
    name            varchar(255) not null,
    description     text,
    is_voided       boolean      NOT NULL DEFAULT FALSE,
    version         integer,
    organisation_id integer      not null,
    audit_id        integer
);

ALTER TABLE ONLY dashboard
    ADD CONSTRAINT dashboard_organisation FOREIGN KEY (organisation_id) REFERENCES organisation (id),
    ADD CONSTRAINT dashboard_master_audit FOREIGN KEY (audit_id) REFERENCES audit (id),
    ADD CONSTRAINT dashboard_uuid_org_id_key unique (uuid, organisation_id);

SELECT enable_rls_on_ref_table('dashboard');


create table dashboard_card_mapping
(
    id              serial primary key,
    uuid            varchar(255) not null,
    dashboard_id    bigint       not null,
    card_id         bigint       not null,
    display_order   double precision      default '-1'::integer not null,
    is_voided       boolean      NOT NULL DEFAULT FALSE,
    version         integer,
    organisation_id integer      not null,
    audit_id        integer
);

ALTER TABLE ONLY dashboard_card_mapping
    ADD CONSTRAINT dashboard_card_organisation FOREIGN KEY (organisation_id) REFERENCES organisation (id),
    ADD CONSTRAINT dashboard_card_master_audit FOREIGN KEY (audit_id) REFERENCES audit (id),
    ADD CONSTRAINT dashboard_card_card FOREIGN KEY (card_id) REFERENCES card (id),
    ADD CONSTRAINT dashboard_card_dashboard FOREIGN KEY (dashboard_id) REFERENCES dashboard (id),
    ADD CONSTRAINT dashboard_card_uuid_org_id_key unique (uuid, organisation_id);

SELECT enable_rls_on_ref_table('dashboard_card_mapping');
