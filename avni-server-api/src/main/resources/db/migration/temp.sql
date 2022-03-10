drop table column_metadata;
drop table table_metadata;
create table table_metadata
(
    id                serial primary key,
    db_user           text,
    name              text,
    type              text,
    subject_type_id   integer references subject_type (id),
    program_id        integer references program (id),
    encounter_type_id integer references encounter_type (id),
    form_id           integer references form (id)
);

create policy table_metadata_rls_policy on table_metadata
    using (db_user = current_user)
    WITH CHECK (db_user = current_user);

ALTER TABLE table_metadata
    ENABLE ROW LEVEL SECURITY;

create index table_metadata_db_user_idx on table_metadata (db_user);

drop table column_metadata;
create table column_metadata
(
    id           serial primary key,
    db_user     text,
    table_id     integer references table_metadata (id),
    name         text,
    type         text,
    concept_id   integer references concept (id),
    concept_type   text,
    concept_uuid CHARACTER VARYING(255)
);

create policy column_metadata_rls_policy on column_metadata
    using (db_user = current_user)
    WITH CHECK (db_user = current_user);

ALTER TABLE column_metadata
    ENABLE ROW LEVEL SECURITY;

create index table_metadata_table_id_idx on column_metadata (table_id);

drop table entity_sync_status;

drop table entity_sync_status;
create table entity_sync_status
(
    id                serial primary key,
    db_user           text,
    table_metadata_id integer references table_metadata (id),
    last_sync_time     timestamp(3) with time zone,
    sync_status       text
);

create policy entity_sync_status_rls_policy on entity_sync_status
    using (db_user = current_user)
    WITH CHECK (db_user = current_user);

-- Visible only to owner. We don't want to add any RLS policies
ALTER TABLE entity_sync_status
    ENABLE ROW LEVEL SECURITY;