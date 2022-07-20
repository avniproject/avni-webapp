create table task_unassignment
(
    id                      serial primary key,
    organisation_id         int                         not null references organisation (id),
    uuid                    character varying(255)      not null default uuid_generate_v4(),
    is_voided               boolean                     NOT NULL DEFAULT FALSE,
    version                 integer                     not null,
    created_by_id           bigint                      not null references users (id),
    last_modified_by_id     bigint                      not null references users (id),
    created_date_time       timestamp(3) with time zone not null,
    last_modified_date_time timestamp(3) with time zone not null,
    task_id                 bigint                      not null references task (id),
    unassigned_user_id      int                         not null references users (id)
);

select enable_rls_on_tx_table('task_unassignment');

drop table task_migration;

