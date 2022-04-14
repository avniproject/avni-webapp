drop policy column_metadata_rls_policy on column_metadata;

alter table column_metadata
    drop column db_user;
alter table column_metadata
    add column schema_name text;

ALTER TABLE column_metadata
    DISABLE ROW LEVEL SECURITY;

alter table table_metadata
    drop column subject_type_id,
    drop column program_id,
    drop column encounter_type_id,
    drop column form_id;

alter table table_metadata
    add column subject_type_uuid   varchar(255),
    add column program_uuid        varchar(255),
    add column encounter_type_uuid varchar(255),
    add column form_uuid           varchar(255);


create policy table_metadata_rls_policy on table_metadata
    using (schema_name in (select schema_name
                           from (select db_user, schema_name
                                 from organisation
                                 union all
                                 select db_user, schema_name
                                 from organisation_group
                                ) s
                           where db_user = current_user))
    WITH CHECK (schema_name in (select schema_name
                                from (select db_user, schema_name
                                      from organisation
                                      union all
                                      select db_user, schema_name
                                      from organisation_group
                                     ) s
                                where db_user = current_user));

ALTER TABLE table_metadata
    ENABLE ROW LEVEL SECURITY;


create policy column_metadata_rls_policy on column_metadata
    using (schema_name in (select schema_name
                           from (select db_user, schema_name
                                 from organisation
                                 union all
                                 select db_user, schema_name
                                 from organisation_group
                                ) s
                           where db_user = current_user))
    WITH CHECK (schema_name in (select schema_name
                                from (select db_user, schema_name
                                      from organisation
                                      union all
                                      select db_user, schema_name
                                      from organisation_group
                                     ) s
                                where db_user = current_user));

ALTER TABLE column_metadata
    ENABLE ROW LEVEL SECURITY;
