--This migration will take some time to update all the entities. It'll be run outside the server release

--subject_type
alter table subject_type
    add column directly_assignable                boolean default false,
    add column should_sync_by_location            boolean default true,
    add column sync_registration_concept_1        varchar(255),
    add column sync_registration_concept_2        varchar(255),
    add column sync_registration_concept_1_usable boolean default false,
    add column sync_registration_concept_2_usable boolean default false;

--individual
alter table individual disable trigger individual_update_audit_before_insert;
alter table individual disable trigger individual_update_audit_before_update;
alter table individual
    add column sync_concept_1_value text,
    add column sync_concept_2_value text;

alter table individual enable trigger individual_update_audit_before_insert;
alter table individual enable trigger individual_update_audit_before_update;
create index individual_sync_1_index on individual(address_id, last_modified_date_time, organisation_id, subject_type_id);
create index individual_sync_2_index on individual(id, last_modified_date_time, organisation_id, subject_type_id);
create index individual_sync_3_index on individual(sync_concept_1_value, last_modified_date_time, organisation_id, subject_type_id);
create index individual_sync_4_index on individual(sync_concept_1_value, sync_concept_2_value, last_modified_date_time, organisation_id, subject_type_id);
create index individual_sync_5_index on individual(address_id, id, sync_concept_1_value, sync_concept_2_value, last_modified_date_time, organisation_id, subject_type_id);

--encounter
alter table encounter disable trigger encounter_update_audit_before_insert;
alter table encounter disable trigger encounter_update_audit_before_update;
drop index encounter_encounter_type_id_index;
drop index encounter_individual_id_index;
drop index encounter_last_modified_time_idx;
drop index encounter_organisation_id__index;
alter table encounter
    add column address_id bigint,
    add column sync_concept_1_value text,
    add column sync_concept_2_value text;

DO
$$
    DECLARE
        page   int := 10000;
        min_id bigint; max_id bigint;
    BEGIN
        SELECT max(id), min(id) INTO max_id, min_id FROM encounter;
        FOR j IN min_id..max_id BY page
            LOOP
                update encounter enc
                set address_id = i.address_id
                from individual i
                where i.id = individual_id
                  and enc.id >= j
                  AND enc.id < j + page;
                COMMIT;
            END LOOP;
    END;
$$;

alter table encounter enable trigger encounter_update_audit_before_insert;
alter table encounter enable trigger encounter_update_audit_before_update;
alter table encounter add constraint encounter_address_level FOREIGN KEY (address_id) references address_level (id);
create index encounter_sync_1_index on encounter(address_id, last_modified_date_time, organisation_id, encounter_type_id);
create index encounter_sync_2_index on encounter(individual_id, last_modified_date_time, organisation_id, encounter_type_id);
create index encounter_sync_3_index on encounter(sync_concept_1_value, last_modified_date_time, organisation_id, encounter_type_id);
create index encounter_sync_4_index on encounter(sync_concept_1_value, sync_concept_2_value, last_modified_date_time, organisation_id, encounter_type_id);
create index encounter_sync_5_index on encounter(address_id, individual_id, sync_concept_1_value, sync_concept_2_value, last_modified_date_time, organisation_id, encounter_type_id);
create index encounter_encounter_type_id_index on encounter (encounter_type_id);
create index encounter_individual_id_index on encounter (individual_id);
create index encounter_last_modified_time_idx on encounter (last_modified_date_time);
create index encounter_organisation_id__index on encounter (organisation_id);


--enrolment
alter table program_enrolment disable trigger program_enrolment_update_audit_before_insert;
alter table program_enrolment disable trigger program_enrolment_update_audit_before_update;
drop index idx_program_enrolment_obs;
drop index program_enrolment_enrolment_date_time__index;
drop index program_enrolment_individual_id_index;
drop index program_enrolment_last_modified_time_idx;
drop index program_enrolment_organisation_id__index;
drop index program_enrolment_program_exit_date_time_index;
drop index program_enrolment_program_id_index;
alter table program_enrolment
    add column address_id bigint,
    add column sync_concept_1_value text,
    add column sync_concept_2_value text;

DO
$$
    DECLARE
        page   int := 10000;
        min_id bigint; max_id bigint;
    BEGIN
        SELECT max(id), min(id) INTO max_id, min_id FROM program_enrolment;
        FOR j IN min_id..max_id BY page
            LOOP
                update program_enrolment enl
                set address_id = i.address_id
                from individual i
                where i.id = individual_id
                  and enl.id >= j
                  AND enl.id < j + page;
                COMMIT;
            END LOOP;
    END;
$$;

alter table program_enrolment enable trigger program_enrolment_update_audit_before_insert;
alter table program_enrolment enable trigger program_enrolment_update_audit_before_update;
alter table program_enrolment add constraint program_enrolment_address_level FOREIGN KEY (address_id) references address_level (id);
create index program_enrolment_enrolment_date_time__index on program_enrolment (enrolment_date_time);
create index program_enrolment_individual_id_index on program_enrolment (individual_id);
create index program_enrolment_last_modified_time_idx on program_enrolment (last_modified_date_time);
create index program_enrolment_organisation_id__index on program_enrolment (organisation_id);
create index program_enrolment_program_exit_date_time_index on program_enrolment (program_exit_date_time);
create index program_enrolment_program_id_index on program_enrolment (program_id);
create index program_enrolment_sync_1_index on program_enrolment(address_id, last_modified_date_time, organisation_id, program_id);
create index program_enrolment_sync_2_index on program_enrolment(individual_id, last_modified_date_time, organisation_id, program_id);
create index program_enrolment_sync_3_index on program_enrolment(sync_concept_1_value, last_modified_date_time, organisation_id, program_id);
create index program_enrolment_sync_4_index on program_enrolment(sync_concept_1_value, sync_concept_2_value, last_modified_date_time, organisation_id, program_id);
create index program_enrolment_sync_5_index on program_enrolment(address_id, individual_id, sync_concept_1_value, sync_concept_2_value, last_modified_date_time, organisation_id, program_id);

---program_encounter
alter table program_encounter disable trigger program_encounter_update_audit_before_insert;
alter table program_encounter disable trigger program_encounter_update_audit_before_update;
drop index idx_program_encounter_obs;
drop index program_encounter_earliest_visit_date_time_index;
drop index program_encounter_encounter_date_time_index;
drop index program_encounter_encounter_type_id_index;
drop index program_encounter_last_modified_time_idx;
drop index program_encounter_organisation_id__index;
drop index program_encounter_program_enrolment_id_index;
alter table program_encounter
    add column address_id bigint,
    add column individual_id bigint,
    add column sync_concept_1_value text,
    add column sync_concept_2_value text;

DO
$$
    DECLARE
        page   int := 10000;
        min_id bigint; max_id bigint;
    BEGIN
        SELECT max(id), min(id) INTO max_id, min_id FROM program_encounter;
        FOR j IN min_id..max_id BY page
            LOOP
                update program_encounter enc
                set address_id = enl.address_id,
                    individual_id = enl.individual_id
                from program_enrolment enl
                where enl.id = program_enrolment_id
                  and enc.id >= j
                  AND enc.id < j + page;
                COMMIT;
            END LOOP;
    END;
$$;

alter table program_encounter enable trigger program_encounter_update_audit_before_insert;
alter table program_encounter enable trigger program_encounter_update_audit_before_update;
alter table program_encounter add constraint program_encounter_address_level FOREIGN KEY (address_id) references address_level (id);
alter table program_encounter add constraint program_encounter_individual FOREIGN KEY (individual_id) references individual (id);
create index program_encounter_earliest_visit_date_time_index on program_encounter (earliest_visit_date_time);
create index program_encounter_encounter_date_time_index on program_encounter (encounter_date_time);
create index program_encounter_encounter_type_id_index on program_encounter (encounter_type_id);
create index program_encounter_last_modified_time_idx on program_encounter (last_modified_date_time);
create index program_encounter_organisation_id__index on program_encounter (organisation_id);
create index program_encounter_program_enrolment_id_index on program_encounter (program_enrolment_id);
create index program_encounter_sync_1_index on program_encounter(address_id, last_modified_date_time, organisation_id, encounter_type_id);
create index program_encounter_sync_2_index on program_encounter(individual_id, last_modified_date_time, organisation_id, encounter_type_id);
create index program_encounter_sync_3_index on program_encounter(sync_concept_1_value, last_modified_date_time, organisation_id, encounter_type_id);
create index program_encounter_sync_4_index on program_encounter(sync_concept_1_value, sync_concept_2_value, last_modified_date_time, organisation_id, encounter_type_id);
create index program_encounter_sync_5_index on program_encounter(address_id, individual_id, sync_concept_1_value, sync_concept_2_value, last_modified_date_time, organisation_id, encounter_type_id);
create index program_encounter_individual_id_index on program_encounter(individual_id);

--group_subject
alter table group_subject disable trigger group_subject_update_audit_before_insert;
alter table group_subject disable trigger group_subject_update_audit_before_update;
drop index group_subject_group_role_id_index;
drop index group_subject_group_subject_id_index;
drop index group_subject_last_modified_time_idx;
drop index group_subject_member_subject_id_index;
alter table group_subject
    add column member_subject_address_id bigint,
    add column group_subject_address_id bigint,
    add column group_subject_sync_concept_1_value text,
    add column group_subject_sync_concept_2_value text;

DO
$$
    DECLARE
        page   int := 10000;
        min_id bigint; max_id bigint;
    BEGIN
        SELECT max(id), min(id) INTO max_id, min_id FROM group_subject;
        FOR j IN min_id..max_id BY page
            LOOP
                update group_subject gs
                set group_subject_address_id = gi.address_id,
                    member_subject_address_id = mi.address_id
                from individual gi, individual mi
                where gi.id = gs.group_subject_id
                  and mi.id = gs.member_subject_id
                  and gs.id >= j
                  AND gs.id < j + page;
                COMMIT;
            END LOOP;
    END;
$$;

alter table group_subject enable trigger group_subject_update_audit_before_insert;
alter table group_subject enable trigger group_subject_update_audit_before_update;
alter table group_subject add constraint group_subject_address_level FOREIGN KEY (group_subject_address_id) references address_level (id);
alter table group_subject add constraint member_subject_address_level FOREIGN KEY (member_subject_address_id) references address_level (id);
create index group_subject_group_role_id_index on group_subject (group_role_id);
create index group_subject_group_subject_id_index on group_subject (group_subject_id);
create index group_subject_last_modified_time_idx on group_subject (last_modified_date_time);
create index group_subject_member_subject_id_index on group_subject (member_subject_id);
create index group_subject_sync_1_index on group_subject(group_subject_address_id, member_subject_address_id, last_modified_date_time, organisation_id);
create index group_subject_sync_2_index on group_subject(group_subject_id, member_subject_id, last_modified_date_time, organisation_id);
create index group_subject_sync_3_index on group_subject(group_subject_sync_concept_1_value, last_modified_date_time, organisation_id);
create index group_subject_sync_4_index on group_subject(group_subject_sync_concept_1_value, group_subject_sync_concept_2_value, last_modified_date_time, organisation_id);
create index group_subject_sync_5_index on group_subject(group_subject_address_id, member_subject_address_id, group_subject_id, member_subject_id, group_subject_sync_concept_1_value, group_subject_sync_concept_2_value, last_modified_date_time, organisation_id);

--users
alter table users
    add column sync_settings jsonb default '{}'::jsonb;


--subject_migration
alter table subject_migration
    add column old_sync_concept_1_value text,
    add column new_sync_concept_1_value text,
    add column old_sync_concept_2_value text,
    add column new_sync_concept_2_value text;

