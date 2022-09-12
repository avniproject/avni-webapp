create table export_job_parameters
(
    id                      SERIAL PRIMARY KEY,
    uuid                    varchar(255)                NOT NULL,
    user_id                 integer                     NOT NULL references users (id),
    output                  jsonb                       NOT NULL,
    filter                  jsonb                       NOT NULL,
    timezone                text                        NOT NULL,
    organisation_id         integer                     NOT NULL references organisation (id),
    is_voided               boolean                     NOT NULL DEFAULT FALSE,
    version                 integer                     not null,
    created_by_id           bigint                      not null references users (id),
    last_modified_by_id     bigint                      not null references users (id),
    created_date_time       timestamp(3) with time zone not null,
    last_modified_date_time timestamp(3) with time zone not null
);

alter table export_job_parameters
    add unique (uuid, organisation_id);

select enable_rls_on_tx_table('export_job_parameters');
