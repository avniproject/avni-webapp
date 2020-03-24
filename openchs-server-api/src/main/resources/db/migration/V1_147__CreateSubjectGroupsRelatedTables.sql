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
