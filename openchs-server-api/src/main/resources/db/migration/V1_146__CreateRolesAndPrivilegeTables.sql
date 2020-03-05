create table privilege
(
    id                      serial primary key,
    uuid                    varchar(255) not null,
    name                    varchar(255) not null,
    description             text,
    entity_type             varchar(255) not null,
    is_voided               boolean      NOT NULL DEFAULT FALSE,
    created_date_time       timestamp with time zone,
    last_modified_date_time timestamp with time zone
);

create table groups
(
    id              serial primary key,
    uuid            varchar(255) not null,
    name            varchar(255) not null,
    is_voided       boolean      NOT NULL DEFAULT FALSE,
    version         integer,
    organisation_id integer      not null,
    audit_id        integer
);


alter table only groups
    add constraint group_organisation foreign key (organisation_id) references organisation (id),
    add constraint group_master_audit foreign key (audit_id) references audit (id);

select enable_rls_on_tx_table('groups');


create table user_group
(
    id              serial primary key,
    uuid            varchar(255) not null,
    user_id         integer      not null,
    group_id        integer      not null,
    is_voided       boolean      NOT NULL DEFAULT FALSE,
    version         integer,
    organisation_id integer      not null,
    audit_id        integer
);

alter table only user_group
    add constraint user_group_organisation foreign key (organisation_id) references organisation (id),
    add constraint user_group_master_audit foreign key (audit_id) references audit (id),
    add constraint user_group_user_id foreign key (user_id) references users (id),
    add constraint user_group_group_id foreign key (group_id) references groups (id);

select enable_rls_on_tx_table('user_group');

create table group_privilege
(
    id                        serial primary key,
    uuid                      varchar(255) not null,
    group_id                  integer      not null,
    privilege_id              integer      not null,
    subject_type_id           integer,
    program_id                integer,
    program_encounter_type_id integer,
    encounter_type_id         integer,
    checklist_detail_id       integer,
    allow                     boolean      NOT NULL DEFAULT FALSE,
    is_voided                 boolean      NOT NULL DEFAULT FALSE,
    version                   integer,
    organisation_id           integer      not null,
    audit_id                  integer
);

alter table only group_privilege
    add constraint group_privilege_organisation foreign key (organisation_id) references organisation (id),
    add constraint group_privilege_master_audit foreign key (audit_id) references audit (id),
    add constraint group_privilege_group_id foreign key (group_id) references groups (id),
    add constraint group_privilege_subject_id foreign key (subject_type_id) references subject_type (id),
    add constraint group_privilege_program_id foreign key (program_id) references program (id),
    add constraint group_privilege_program_encounter_type_id foreign key (program_encounter_type_id) references encounter_type (id),
    add constraint group_privilege_encounter_type_id foreign key (encounter_type_id) references encounter_type (id),
    add constraint group_privilege_checklist_detail_id foreign key (checklist_detail_id) references checklist_detail (id);

select enable_rls_on_tx_table('user_group');
select enable_rls_on_tx_table('group_privilege');

insert into privilege(uuid, name, description, entity_type, created_date_time, last_modified_date_time)
values ('67410e50-8b40-4735-bfb4-135b13580027', 'View subject', 'View subject', 'Subject', current_timestamp,
        current_timestamp),
       ('46c3aa38-1ef5-4639-a406-d0b4f9bcb420', 'Register subject', 'Register subject', 'Subject', current_timestamp,
        current_timestamp),
       ('db791f27-0c04-4060-8938-6f18fb4069ee', 'Edit subject', 'Edit subject', 'Subject', current_timestamp,
        current_timestamp),
       ('088a30ca-9ce2-4ab3-a517-e249cc43a4bf', 'Void subject', 'Void subject', 'Subject', current_timestamp,
        current_timestamp),
       ('020c5e18-01f0-469a-8a4a-e27cbc2a2292', 'Enrol subject', 'Enrol subject', 'Enrolment', current_timestamp,
        current_timestamp),
       ('583188ff-cd10-4615-9e22-000ce0bc6d80', 'View enrolment details', 'View enrolment details', 'Enrolment',
        current_timestamp, current_timestamp),
       ('a1dcc42f-eed4-4baf-807a-4f6e238f1cba', 'Edit enrolment details', 'Edit enrolment details', 'Enrolment',
        current_timestamp, current_timestamp),
       ('bd419d1e-cfc6-4607-8cad-38871721115d', 'Exit enrolment', 'Exit enrolment', 'Enrolment', current_timestamp,
        current_timestamp),
       ('9f2a3495-93b7-47c3-8560-d572b6a9fc61', 'View visit', 'View visit', 'Encounter', current_timestamp,
        current_timestamp),
       ('867d5de9-0bf3-434c-9cb1-bd09a05250af', 'Schedule visit', 'Schedule visit', 'Encounter', current_timestamp,
        current_timestamp),
       ('e3352a23-f478-4166-af11-e949cc69e1cc', 'Perform visit', 'Perform visit', 'Encounter', current_timestamp,
        current_timestamp),
       ('85ce5ed4-1490-4980-8c64-63fb423b5f14', 'Edit visit', 'Edit visit', 'Encounter', current_timestamp,
        current_timestamp),
       ('51fa8342-3228-4945-88eb-4b41970fa425', 'Cancel visit', 'Cancel visit', 'Encounter', current_timestamp,
        current_timestamp),
       ('450a83ed-0e49-4b4c-8b8c-2dbfebcd7e5d', 'View checklist', 'View checklist', 'Checklist', current_timestamp,
        current_timestamp),
       ('79bcebce-4177-471d-8f0d-5558fbd91b76', 'Edit checklist', 'Edit checklist', 'Checklist', current_timestamp,
        current_timestamp);

insert into groups(uuid, name, version, organisation_id, audit_id)
select uuid_generate_v4(),
       'Everyone',
       0,
       id,
       create_audit()
from organisation;

insert into user_group(uuid, user_id, group_id, version, organisation_id, audit_id)
select uuid_generate_v4(),
       u.id,
       (select g.id from groups g where u.organisation_id = g.organisation_id and g.name = 'Everyone'),
       0,
       u.organisation_id,
       create_audit()
from users u;

--subject privilege
insert into group_privilege
(uuid, group_id, privilege_id, subject_type_id, program_id, program_encounter_type_id, encounter_type_id,
 checklist_detail_id, version, organisation_id, audit_id, allow)
select uuid_generate_v4(),
       g.id,
       p.id,
       s.subject_type_id,
       null,
       null,
       null,
       null,
       0,
       s.organisation_id,
       create_audit(),
       true
from operational_subject_type s
         left join groups g on g.organisation_id = s.organisation_id
         join privilege p on true
where p.name in ('View subject', 'Register subject', 'Edit subject', 'Void subject');

--program privilege
insert into group_privilege
(uuid, group_id, privilege_id, subject_type_id, program_id, program_encounter_type_id, encounter_type_id,
 checklist_detail_id, version, organisation_id, audit_id, allow)
select uuid_generate_v4(),
       g.id,
       p.id,
       s.subject_type_id,
       op.program_id,
       null,
       null,
       null,
       0,
       s.organisation_id,
       create_audit(),
       true
from operational_subject_type s
         left join operational_program op on op.organisation_id = s.organisation_id
         left join groups g on g.organisation_id = s.organisation_id
         join privilege p on true
where p.name in ('Enrol subject', 'View enrolment details', 'Edit enrolment details', 'Exit enrolment');

--Visit privilege
insert into group_privilege
(uuid, group_id, privilege_id, subject_type_id, program_id, program_encounter_type_id, encounter_type_id,
 checklist_detail_id, version, organisation_id, audit_id, allow)
select uuid_generate_v4(),
       g.id,
       p.id,
       fm.subject_type_id,
       fm.entity_id,
       case
           when fm.entity_id notnull then fm.observations_type_entity_id
           else null end,
       case
           when fm.entity_id isnull then fm.observations_type_entity_id
           else null end,
       null,
       0,
       fm.organisation_id,
       create_audit(),
       true
from form_mapping fm
         left join groups g on g.organisation_id = fm.organisation_id
         join privilege p on true
where p.name in ('View visit', 'Schedule visit', 'Perform visit', 'Edit visit', 'Cancel visit')
  and fm.observations_type_entity_id notnull;

--checklist privilege
insert into group_privilege
(uuid, group_id, privilege_id, subject_type_id, program_id, program_encounter_type_id, encounter_type_id,
 checklist_detail_id, version, organisation_id, audit_id, allow)
select uuid_generate_v4(),
       g.id,
       p.id,
       s.subject_type_id,
       null,
       null,
       null,
       cd.id,
       0,
       s.organisation_id,
       create_audit(),
       true
from operational_subject_type s
         left join checklist_detail cd on s.organisation_id = cd.organisation_id
         left join groups g on g.organisation_id = s.organisation_id
         join privilege p on true
where p.name in ('View checklist', 'Edit checklist');