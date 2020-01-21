CREATE OR REPLACE FUNCTION grant_all_on_all(rolename text)
    RETURNS text AS
$body$
BEGIN
    EXECUTE (
        SELECT 'GRANT ALL ON TABLE '
                   || string_agg(format('%I.%I', table_schema, table_name), ',')
                   || ' TO ' || quote_ident(rolename) || ''
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
    );

    EXECUTE (
        SELECT 'GRANT SELECT ON '
                   || string_agg(format('%I.%I', schemaname, viewname), ',')
                   || ' TO ' || quote_ident(rolename) || ''
        FROM pg_catalog.pg_views
        WHERE schemaname = 'public'
          and viewowner in ('openchs')
    );

    EXECUTE 'GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO ' || quote_ident(rolename) || '';
    EXECUTE 'GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO ' || quote_ident(rolename) || '';
    RETURN 'ALL PERMISSIONS GRANTED TO ' || quote_ident(rolename);
END;
$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION grant_all_on_views(view_names text[], role text)
    RETURNS text AS
$body$
DECLARE
    view_names_string text;
    each record;
BEGIN
    view_names_string := array_to_string(view_names, ',');
    FOR each IN SELECT rolname FROM pg_roles where pg_has_role('openchs', oid, 'member') LOOP
        EXECUTE 'REVOKE ALL ON ' || view_names_string || ' FROM ' || quote_ident(each.rolname) || '';
    END LOOP;
    EXECUTE 'GRANT ALL ON ' || view_names_string || ' TO ' || quote_ident(role) || '';
    RETURN 'EXECUTE GRANT ALL ON ' || view_names_string || ' TO ' || quote_ident(role) || '';
END;
$body$ LANGUAGE plpgsql;

SELECT grant_all_on_all(a.rolname)
FROM pg_roles a
WHERE pg_has_role('openchs', a.oid, 'member');
