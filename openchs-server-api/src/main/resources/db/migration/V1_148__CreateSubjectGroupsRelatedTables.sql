ALTER TABLE subject_type
    ADD COLUMN is_group BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE group_role
(
    id                        SERIAL PRIMARY KEY,
    uuid                      varchar(255) NOT NULL,
    group_subject_type_id     integer      NOT NULL,
    role                      text,
    member_subject_type_id    integer      NOT NULL,
    is_primary                boolean      NOT NULL DEFAULT FALSE,
    maximum_number_of_members integer      NOT NULL,
    minimum_number_of_members integer      NOT NULL,
    organisation_id           integer      NOT NULL,
    audit_id                  integer,
    is_voided                 boolean      NOT NULL DEFAULT FALSE,
    version                   integer
);

ALTER TABLE ONLY group_role
    ADD CONSTRAINT group_role_organisation FOREIGN KEY (organisation_id) REFERENCES organisation (id),
    ADD CONSTRAINT group_role_master_audit FOREIGN KEY (audit_id) REFERENCES audit (id),
    ADD CONSTRAINT group_role_group_subject_type FOREIGN KEY (group_subject_type_id) REFERENCES subject_type (id),
    ADD CONSTRAINT group_role_member_subject_type FOREIGN KEY (member_subject_type_id) REFERENCES subject_type (id),
    ADD CONSTRAINT group_role_org_id unique (role, organisation_id);

CREATE TABLE group_subject
(
    id                    SERIAL PRIMARY KEY,
    uuid                  varchar(255) NOT NULL,
    group_subject_id      integer      NOT NULL,
    member_subject_id     integer      NOT NULL,
    group_role_id         integer      NOT NULL,
    membership_start_date timestamp with time zone,
    membership_end_date   timestamp with time zone,
    organisation_id       integer      NOT NULL,
    audit_id              integer,
    is_voided             boolean      NOT NULL DEFAULT FALSE,
    version               integer
);

ALTER TABLE ONLY group_subject
    ADD CONSTRAINT group_subject_organisation FOREIGN KEY (organisation_id) REFERENCES organisation (id),
    ADD CONSTRAINT group_subject_master_audit FOREIGN KEY (audit_id) REFERENCES audit (id),
    ADD CONSTRAINT group_subject_group_subject FOREIGN KEY (group_subject_id) REFERENCES individual (id),
    ADD CONSTRAINT group_subject_member_subject FOREIGN KEY (member_subject_id) REFERENCES individual (id),
    ADD CONSTRAINT group_subject_group_role FOREIGN KEY (group_role_id) REFERENCES group_role (id);

SELECT enable_rls_on_ref_table('group_role');
SELECT enable_rls_on_tx_table('group_subject');

insert into privilege(uuid, name, description, entity_type, created_date_time, last_modified_date_time)
values ('0843ee63-721c-49c5-8374-818b512caf82', 'Add member', 'Add member', 'Subject', current_timestamp,
        current_timestamp),
       ('d9d7ae77-a67e-4644-8976-5b3551106a53', 'Edit member', 'Edit member', 'Subject', current_timestamp,
        current_timestamp),
       ('f2915fc4-d2cb-492a-b9bc-88a7bae11b75', 'Remove member', 'Remove member', 'Subject', current_timestamp,
        current_timestamp);
