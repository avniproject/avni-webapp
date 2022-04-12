create table answer_concept_migration
(
    id                      SERIAL PRIMARY KEY,
    uuid                    varchar(255)                NOT NULL,
    concept_id              integer                     NOT NULL references concept (id),
    old_answer_concept_name varchar(255)                NOT NULL,
    new_answer_concept_name varchar(255)                NOT NULL,
    organisation_id         integer                     NOT NULL,
    is_voided               boolean                     NOT NULL DEFAULT FALSE,
    version                 integer                     not null,
    created_by_id           bigint                      not null,
    last_modified_by_id     bigint                      not null,
    created_date_time       timestamp(3) with time zone not null,
    last_modified_date_time timestamp(3) with time zone not null
);

alter table answer_concept_migration
    add unique (uuid, organisation_id);

select enable_rls_on_ref_table('answer_concept_migration');

