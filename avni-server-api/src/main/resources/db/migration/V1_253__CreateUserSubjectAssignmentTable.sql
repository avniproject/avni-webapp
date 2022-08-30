alter table individual drop column assigned_user_id;

create table user_subject_assignment
(
    id                      SERIAL PRIMARY KEY,
    uuid                    varchar(255)                NOT NULL,
    user_id                 integer                     NOT NULL references users (id),
    subject_id              integer                     NOT NULL references individual (id),
    organisation_id         integer                     NOT NULL references organisation(id),
    is_voided               boolean                     NOT NULL DEFAULT FALSE,
    version                 integer                     not null,
    created_by_id           bigint                      not null references users(id),
    last_modified_by_id     bigint                      not null references users(id),
    created_date_time       timestamp(3) with time zone not null,
    last_modified_date_time timestamp(3) with time zone not null
);

alter table user_subject_assignment
    add unique (uuid, organisation_id);

create index user_subject_assignment_user_id_index on user_subject_assignment (user_id);
create index user_subject_assignment_subject_id_index on user_subject_assignment (subject_id);

select enable_rls_on_tx_table('user_subject_assignment');
