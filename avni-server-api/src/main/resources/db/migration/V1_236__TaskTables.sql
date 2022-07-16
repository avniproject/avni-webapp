create table task_type
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
    name                    text                        not null,
    type                    text                        not null,
    metadata_search_fields  jsonb                       not null
);
CREATE INDEX IF NOT EXISTS task_type_metadata_search_fields_idx ON task_type USING GIN (metadata_search_fields jsonb_path_ops);

create table task_status
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
    name                    text                        not null,
    task_type_id            int                         not null references task_type (id),
    is_terminal             bool                        not null
);

create table task
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
    legacy_id               varchar                     null,
    name                    text                        not null,
    task_status_id          int                         not null references task_status (id),
    scheduled_on            timestamp                   null,
    completed_on            timestamp                   null,
    assigned_user_id        int                         not null references users (id),
    metadata                jsonb                       not null,
    subject_id              bigint                      not null references individual (id),
    observations            jsonb                       not null
);
CREATE INDEX IF NOT EXISTS task_metadata_idx ON task USING GIN (metadata jsonb_path_ops);
CREATE INDEX IF NOT EXISTS task_observations_idx ON task USING GIN (observations jsonb_path_ops);

create table task_migration
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
    old_assigned_user_id    int                         not null references users (id),
    new_assigned_user_id    int                         not null references users (id)
);

alter table form add column task_schedule_declarative_rule text null;
alter table form add column task_schedule_rule text null;
