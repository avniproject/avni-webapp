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

CREATE OR REPLACE FUNCTION audit_table_trigger()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
AS
$$
BEGIN
    IF NEW.audit_id is null THEN
        insert into audit (uuid, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
        values (uuid_generate_v4(), NEW.created_by_id, NEW.last_modified_by_id, NEW.created_date_time,
                NEW.last_modified_date_time)
        returning id into NEW.audit_id;
    else
        update audit
        set last_modified_date_time = NEW.last_modified_date_time,
            last_modified_by_id     = NEW.last_modified_by_id
        where id = NEW.audit_id;
    END IF;

    RETURN NEW;
END;
$$;

create or replace function migrate_audit_columns(table_name text) returns void
    language plpgsql
as
$$
BEGIN
    execute 'alter table ' || table_name || '
        add column created_by_id           bigint,
        add column last_modified_by_id     bigint,
        add column created_date_time       timestamp with time zone,
        add column last_modified_date_time timestamp with time zone;';
    RAISE NOTICE 'added columns to %', table_name ;

    execute 'update ' || table_name || '
        set created_by_id           = a.created_by_id,
            last_modified_by_id     = a.last_modified_by_id,
            created_date_time       = a.created_date_time,
            last_modified_date_time = a.last_modified_date_time
        from audit a
        where ' || table_name || '.audit_id = a.id;';
    RAISE NOTICE 'updated values of audit fields in %', table_name;

    execute 'alter table ' || table_name || '
        alter column created_by_id set not null,
        alter column last_modified_by_id set not null,
        alter column created_date_time set not null,
        alter column last_modified_date_time set not null;';
    RAISE NOTICE 'set audit fields to non-null %', table_name ;

    execute 'CREATE INDEX ' || table_name || '_last_modified_time_idx
        ON ' || table_name || '(last_modified_date_time);';
    RAISE NOTICE 'create index on last_modified_date_time %', table_name ;

    execute 'CREATE TRIGGER ' || table_name ||  '_update_audit_before_insert
            BEFORE INSERT
            ON ' || table_name || '
            FOR EACH ROW
        EXECUTE PROCEDURE audit_table_trigger();';
    RAISE NOTICE 'create trigger on insert %', table_name ;

    execute 'CREATE TRIGGER ' || table_name ||  '_update_audit_before_update
            BEFORE UPDATE
            ON ' || table_name || '
            FOR EACH ROW
        EXECUTE PROCEDURE audit_table_trigger();';
    RAISE NOTICE 'create trigger on update %', table_name ;

END
$$;
