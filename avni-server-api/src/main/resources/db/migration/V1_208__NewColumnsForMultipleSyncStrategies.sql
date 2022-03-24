--subject_type
alter table subject_type
    add column directly_assignable                boolean default false,
    add column should_sync_by_location            boolean default true,
    add column sync_registration_concept_1        varchar(255),
    add column sync_registration_concept_2        varchar(255),
    add column sync_registration_concept_1_usable boolean default false,
    add column sync_registration_concept_2_usable boolean default false;

--individual
alter table individual
    add column sync_concept_1_value text,
    add column sync_concept_2_value text;

--encounter
alter table encounter
    add column address_id bigint,
    add column sync_concept_1_value text,
    add column sync_concept_2_value text;

--enrolment
alter table program_enrolment
    add column address_id bigint,
    add column sync_concept_1_value text,
    add column sync_concept_2_value text;

---program_encounter
alter table program_encounter
    add column address_id bigint,
    add column individual_id bigint,
    add column sync_concept_1_value text,
    add column sync_concept_2_value text;

--group_subject
alter table group_subject
    add column member_subject_address_id bigint,
    add column group_subject_address_id bigint,
    add column group_subject_sync_concept_1_value text,
    add column group_subject_sync_concept_2_value text;

--users
alter table users
    add column sync_settings jsonb default '{}'::jsonb;


--subject_migration
alter table subject_migration
    add column old_sync_concept_1_value text,
    add column new_sync_concept_1_value text,
    add column old_sync_concept_2_value text,
    add column new_sync_concept_2_value text;

