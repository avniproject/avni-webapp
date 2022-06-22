create table reset_sync
(
    id                      SERIAL PRIMARY KEY,
    uuid                    varchar(255)                NOT NULL,
    user_id                 integer                     references users (id),
    subject_type_id         integer                     references subject_type (id),
    organisation_id         integer                     NOT NULL references organisation (id),
    is_voided               boolean                     NOT NULL DEFAULT FALSE,
    version                 integer                     not null,
    created_by_id           bigint                      not null,
    last_modified_by_id     bigint                      not null,
    created_date_time       timestamp(3) with time zone not null,
    last_modified_date_time timestamp(3) with time zone not null
);

alter table reset_sync
    add unique (uuid, organisation_id);

create index reset_sync_user_id_index on reset_sync (user_id);
create index reset_sync_subject_type_id_index on reset_sync (subject_type_id);

select enable_rls_on_tx_table('reset_sync');
