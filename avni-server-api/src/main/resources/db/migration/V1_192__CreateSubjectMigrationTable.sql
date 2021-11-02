create table subject_migration
(
    id                   SERIAL PRIMARY KEY,
    uuid                 varchar(255) NOT NULL,
    individual_id        integer      NOT NULL references individual (id),
    old_address_level_id integer      not null references address_level (id),
    new_address_level_id integer      not null references address_level (id),
    organisation_id      integer      NOT NULL,
    audit_id             integer      not null references audit (id),
    is_voided            boolean      NOT NULL DEFAULT FALSE,
    version              integer not null
);

alter table subject_migration add unique (uuid, organisation_id);

select enable_rls_on_tx_table('subject_migration');

