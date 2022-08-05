create table subject_program_eligibility
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
    subject_id              bigint                      not null references individual(id),
    program_id              int                         not null references program(id),
    is_eligible             bool                        not null,
    check_date              timestamp with time zone    not null
);

select enable_rls_on_ref_table('subject_program_eligibility');

alter table subject_type add column program_eligibility_check_rule text null;
alter table subject_type add column program_eligibility_check_declarative_rule text null;

alter table program add column manual_eligibility_check_required bool not null default false;
alter table program add column program_eligibility_check_rule text null;
alter table program add column program_eligibility_check_declarative_rule text null;
