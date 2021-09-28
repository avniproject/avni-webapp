create table organisation_config
(
    id              serial primary key,
    uuid            varchar(255) not null,
    organisation_id bigint       not null,
    settings          jsonb
);

alter table only organisation_config
    add constraint organisation_config_organisation foreign key (organisation_id) references organisation (id);

select enable_rls_on_tx_table('organisation_config')
