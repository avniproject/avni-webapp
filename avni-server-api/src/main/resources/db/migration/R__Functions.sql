DROP FUNCTION IF EXISTS create_db_user(inrolname text, inpassword text);
CREATE OR REPLACE FUNCTION create_db_user(inrolname text, inpassword text)
  RETURNS BIGINT AS
$BODY$
  BEGIN
    IF NOT EXISTS(SELECT rolname FROM pg_roles WHERE rolname = inrolname)
    THEN
      EXECUTE 'CREATE ROLE ' || quote_ident(inrolname) || ' NOINHERIT LOGIN PASSWORD ' || quote_literal(inpassword);
    END IF;
    EXECUTE 'GRANT ' || quote_ident(inrolname) || ' TO openchs';
    PERFORM grant_all_on_all(inrolname);
    RETURN 1;
  END
$BODY$ LANGUAGE PLPGSQL;


DROP FUNCTION IF EXISTS create_implementation_schema(text);
CREATE OR REPLACE FUNCTION create_implementation_schema(schema_name text, db_user text)
  RETURNS BIGINT AS
$BODY$
BEGIN
  EXECUTE 'CREATE SCHEMA IF NOT EXISTS "' || schema_name || '" AUTHORIZATION "' || db_user || '"';
  EXECUTE 'GRANT ALL PRIVILEGES ON SCHEMA "' || schema_name || '" TO "' || db_user || '"';
  RETURN 1;
END
$BODY$ LANGUAGE PLPGSQL;


CREATE OR REPLACE FUNCTION jsonb_object_values_contain(obs JSONB, pattern TEXT)
  RETURNS BOOLEAN AS $$
BEGIN
  return EXISTS (select true from jsonb_each_text(obs) where value ilike pattern);
END;
$$
LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION create_audit(user_id NUMERIC)
  RETURNS INTEGER AS $$
DECLARE result INTEGER;
BEGIN
  INSERT INTO audit(created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES(user_id, user_id, now(), now()) RETURNING id into result;
  RETURN result;
END $$
  LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_audit()
  RETURNS INTEGER AS 'select create_audit(1)' language sql;

-- These were failing tests, removing them for now.
-- DROP function if exists get_observation_pattern;
-- DROP function if exists get_outer_query(text, text);
-- DROP function if exists get_outer_query(text);
-- DROP function if exists web_search_function;

DROP FUNCTION IF EXISTS create_view(text, text, text);
CREATE OR REPLACE FUNCTION create_view(schema_name text, view_name text, sql_query text)
    RETURNS BIGINT AS
$BODY$
BEGIN
--     EXECUTE 'set search_path = ' || ;
    EXECUTE 'DROP VIEW IF EXISTS ' || schema_name || '.' || view_name;
    EXECUTE 'CREATE OR REPLACE VIEW ' || schema_name || '.' || view_name || ' AS ' || sql_query;
    RETURN 1;
END
$BODY$ LANGUAGE PLPGSQL;

DROP FUNCTION IF EXISTS drop_view(text, text);
CREATE OR REPLACE FUNCTION drop_view(schema_name text, view_name text)
    RETURNS BIGINT AS
$BODY$
BEGIN
    EXECUTE 'set search_path = ' || schema_name;
    EXECUTE 'DROP VIEW IF EXISTS ' || view_name;
    EXECUTE 'reset search_path';
    RETURN 1;
END
$BODY$ LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION concept_name(TEXT) RETURNS TEXT
    stable
    strict
    language sql
as
$$
SELECT name
FROM concept
WHERE uuid = $1;
$$;

CREATE OR REPLACE FUNCTION update_sync_attributes(indId NUMERIC,
                                                  addressId NUMERIC,
                                                  syncConcept1Value TEXT,
                                                  syncConcept2Value TEXT)
    RETURNS INTEGER AS
$$
BEGIN
    update individual
    set sync_concept_1_value = nullif(syncConcept1Value, ''),
        sync_concept_2_value = nullif(syncConcept2Value, '')
    where id = indId;
    update encounter
    set address_id           = addressId,
        sync_concept_1_value = nullif(syncConcept1Value, ''),
        sync_concept_2_value = nullif(syncConcept2Value, '')
    where individual_id = indId;
    update program_enrolment
    set address_id           = addressId,
        sync_concept_1_value = nullif(syncConcept1Value, ''),
        sync_concept_2_value = nullif(syncConcept2Value, '')
    where individual_id = indId;
    update program_encounter
    set address_id           = addressId,
        sync_concept_1_value = nullif(syncConcept1Value, ''),
        sync_concept_2_value = nullif(syncConcept2Value, '')
    where individual_id = indId;
    update group_subject
    set group_subject_address_id           = addressId,
        group_subject_sync_concept_1_value = nullif(syncConcept1Value, ''),
        group_subject_sync_concept_2_value = nullif(syncConcept2Value, '')
    where group_subject_id = indId;
    update group_subject
    set member_subject_address_id = addressId
    where member_subject_id = indId;
    RETURN 1;
END
$$
    LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_concept_sync_attributes(subjectTypeId NUMERIC, syncConcept1 TEXT, syncConcept2 TEXT)
    RETURNS INTEGER AS
$$
BEGIN
    update individual
    set sync_concept_1_value = individual.observations ->> syncConcept1,
        sync_concept_2_value = individual.observations ->> syncConcept2
    where subject_type_id = subjectTypeId;

    update encounter
    set sync_concept_1_value = i.sync_concept_1_value,
        sync_concept_2_value = i.sync_concept_2_value
    from individual i
    where individual_id = i.id
      and i.subject_type_id = subjectTypeId;

    update program_enrolment
    set sync_concept_1_value = i.sync_concept_1_value,
        sync_concept_2_value = i.sync_concept_2_value
    from individual i
    where individual_id = i.id
      and i.subject_type_id = subjectTypeId;

    update program_encounter
    set sync_concept_1_value = i.sync_concept_1_value,
        sync_concept_2_value = i.sync_concept_2_value
    from individual i
    where individual_id = i.id
      and i.subject_type_id = subjectTypeId;

    update group_subject
    set group_subject_sync_concept_1_value = i.sync_concept_1_value,
        group_subject_sync_concept_2_value = i.sync_concept_2_value
    from individual i
    where group_subject_id = i.id
      and i.subject_type_id = subjectTypeId;
    RETURN 1;
END
$$
    LANGUAGE plpgsql;
