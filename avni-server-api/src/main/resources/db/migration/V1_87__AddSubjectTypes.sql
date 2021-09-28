create table subject_type (
  id              serial primary key,
  uuid            varchar(255),
  name           varchar(255) not null,
  organisation_id bigint       not null,
  is_voided       boolean      not null default false,
  audit_id        bigint       not null,
  version         integer               default 1
);

alter table only subject_type
  add constraint subject_type_audit foreign key (audit_id) references audit (id);
ALTER TABLE ONLY subject_type
  ADD CONSTRAINT subject_type_organisation FOREIGN KEY (organisation_id) REFERENCES organisation (id);

ALTER TABLE subject_type ENABLE ROW LEVEL SECURITY;

CREATE POLICY subject_type_orgs
  ON subject_type USING (organisation_id IN
                  (WITH RECURSIVE list_of_orgs(id, parent_organisation_id) AS (SELECT id, parent_organisation_id
                                                                               FROM organisation
                                                                               WHERE db_user = current_user
                                                                               UNION ALL SELECT o.id,
                                                                                                o.parent_organisation_id
                                                                                         FROM organisation o,
                                                                                              list_of_orgs log
                                                                                         WHERE o.id = log.parent_organisation_id) SELECT id
                                                                                                                                  FROM list_of_orgs))
WITH CHECK ((organisation_id = (select id
                                from organisation
                                where db_user = current_user)));

create table operational_subject_type (
  id              serial primary key,
  uuid            varchar(255) UNIQUE NOT NULL,
  name           varchar(255) not null,
  subject_type_id       INTEGER REFERENCES subject_type (id) NOT NULL,
  organisation_id bigint       not null,
  is_voided       boolean      not null default false,
  audit_id        bigint       not null,
  version         integer               default 1

);

alter table only operational_subject_type
  add constraint operational_subject_type_audit foreign key (audit_id) references audit (id);
ALTER TABLE ONLY operational_subject_type
  ADD CONSTRAINT operational_subject_type_organisation FOREIGN KEY (organisation_id) REFERENCES organisation (id);

ALTER TABLE operational_subject_type ENABLE ROW LEVEL SECURITY;

CREATE POLICY operational_subject_type_orgs
  ON operational_subject_type USING (organisation_id IN
                  (WITH RECURSIVE list_of_orgs(id, parent_organisation_id) AS (SELECT id, parent_organisation_id
                                                                               FROM organisation
                                                                               WHERE db_user = current_user
                                                                               UNION ALL SELECT o.id,
                                                                                                o.parent_organisation_id
                                                                                         FROM organisation o,
                                                                                              list_of_orgs log
                                                                                         WHERE o.id = log.parent_organisation_id) SELECT id
                                                                                                                                  FROM list_of_orgs))
WITH CHECK ((organisation_id = (select id
                                from organisation
                                where db_user = current_user)));



--insert individual subject type
insert into subject_type(uuid, name, organisation_id, audit_id) VALUES ('9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3', 'Individual', 1, create_audit());
ALTER TABLE individual ALTER COLUMN date_of_birth DROP NOT NULL;
ALTER TABLE individual ALTER COLUMN gender_id DROP NOT NULL;
