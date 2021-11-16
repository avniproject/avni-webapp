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

create or replace function create_audit_columns(table_name text) returns void
    language plpgsql
as
$$
BEGIN
    execute 'alter table ' || table_name || '
        add column created_by_id           bigint,
        add column last_modified_by_id     bigint,
        add column created_date_time       timestamp(3) with time zone,
        add column last_modified_date_time timestamp(3) with time zone;';
    RAISE NOTICE 'added columns to %', table_name ;
END
$$;


create or replace procedure update_audit_columns_from_audit_table(table_name text)
    language plpgsql
as
$$
BEGIN
    execute 'update ' || table_name || '
        set created_by_id           = a.created_by_id,
            last_modified_by_id     = a.last_modified_by_id,
            created_date_time       = a.created_date_time,
            last_modified_date_time = a.last_modified_date_time
        from audit a
        where ' || table_name || '.audit_id = a.id;';
    RAISE NOTICE 'updated values of audit fields in %', table_name;
END
$$;


create or replace function solidify_audit_columns(table_name text) returns void
    language plpgsql
as
$$
BEGIN
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
