create table video (
  id              serial primary key,
  version         integer               default 1,
  audit_id        bigint       not null,
  uuid            varchar(255),
  organisation_id bigint       not null,
  title           varchar(255) not null,
  file_path       varchar(255) not null,
  description     varchar(255),
  duration        integer,
  is_voided       boolean      not null default false
);

alter table only video
  add constraint video_audit foreign key (audit_id) references audit (id);
ALTER TABLE ONLY video
  ADD CONSTRAINT video_organisation FOREIGN KEY (organisation_id) REFERENCES organisation (id);

CREATE POLICY video_orgs
  ON video USING (organisation_id IN
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
