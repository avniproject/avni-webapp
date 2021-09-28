create table user_settings
(
    id              serial primary key,
    user_id         integer not null,
    audit_id        bigint  not null,
    organisation_id bigint  not null,
    version         integer          default 1,
    uuid            varchar(255),
    is_voided       boolean not null default false,
    track_location  boolean not null default false,
    locale          varchar(255)  not null default 'en'
);

alter table only user_settings
    add constraint user_settings_audit foreign key (audit_id) references audit (id),
    add constraint user_settings_organisation foreign key (organisation_id) references organisation (id),
    add constraint user_settings_user foreign key (user_id) references users (id);

ALTER TABLE user_settings
    ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_settings_orgs
    ON user_settings USING (organisation_id IN
                            (WITH RECURSIVE list_of_orgs(id, parent_organisation_id) AS (SELECT id, parent_organisation_id
                                                                                         FROM organisation
                                                                                         WHERE db_user = current_user
                                                                                         UNION ALL
                                                                                         SELECT o.id,
                                                                                                o.parent_organisation_id
                                                                                         FROM organisation o,
                                                                                              list_of_orgs log
                                                                                         WHERE o.id = log.parent_organisation_id) SELECT id
                                                                                                                                  FROM list_of_orgs))
    WITH CHECK ((organisation_id = (select id
                                    from organisation
                                    where db_user = current_user)));
