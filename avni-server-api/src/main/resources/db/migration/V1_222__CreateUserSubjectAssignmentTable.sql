create table user_subject_assignment
(
    id                      SERIAL PRIMARY KEY,
    uuid                    varchar(255)                NOT NULL,
    user_id                 integer                     NOT NULL references users (id),
    subject_id              integer                     NOT NULL references individual (id),
    organisation_id         integer                     NOT NULL,
    is_voided               boolean                     NOT NULL DEFAULT FALSE,
    version                 integer                     not null,
    created_by_id           bigint                      not null,
    last_modified_by_id     bigint                      not null,
    created_date_time       timestamp(3) with time zone not null,
    last_modified_date_time timestamp(3) with time zone not null
);

alter table user_subject_assignment
    add unique (uuid, organisation_id);

create index user_subject_assignment_user_id_index on user_subject_assignment (user_id);
create index user_subject_assignment_subject_id_index on user_subject_assignment (subject_id);

select enable_rls_on_tx_table('user_subject_assignment');


insert into user_subject_assignment(uuid, user_id, subject_id, organisation_id, is_voided, version, created_by_id,
                                    last_modified_by_id, created_date_time, last_modified_date_time)
select uuid_generate_v4(),
       id,
       jsonb_array_elements(sync_settings -> 'subjectIds')::integer,
       organisation_id,
       is_voided,
       0,
       1,
       1,
       current_timestamp,
       current_timestamp
from users
where sync_settings -> 'subjectIds' notnull;


update users
set sync_settings = sync_settings - 'subjectIds'
where sync_settings -> 'subjectIds' notnull;
