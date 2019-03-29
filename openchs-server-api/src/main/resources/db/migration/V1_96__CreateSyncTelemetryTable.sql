create table sync_telemetry
(
    id              serial primary key,
    uuid            varchar(255)             not null,
    user_id         integer                  not null,
    organisation_id bigint                   not null,
    version         integer default 1,
    sync_status     varchar(255)             not null,
    sync_start_time timestamp with time zone not null,
    sync_end_time   timestamp with time zone,
    entity_status   JSONB
);

alter table only sync_telemetry
    add constraint sync_telemetry_organisation foreign key (organisation_id) references organisation (id),
    add constraint sync_telemetry_user foreign key (user_id) references users (id);

select enable_rls_on_tx_table('sync_telemetry')