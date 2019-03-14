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
    EXECUTE 'GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO ' || quote_ident(rolename) || '';
    EXECUTE 'GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO ' || quote_ident(rolename) || '';
    RETURN 'ALL PERMISSIONS GRANTED TO ' || quote_ident(rolename);
END;
$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION revoke_all_on_views(view_names text, rolename text)
    RETURNS text AS
$body$
BEGIN
    EXECUTE 'REVOKE ALL ON ' || view_names || ' FROM ' || quote_ident(rolename) || '';
    RETURN 'EXECUTE REVOKE ALL ON ' || view_names || ' FROM ' || quote_ident(rolename) || '';
END;
$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION grant_all_on_views(view_names text, rolename text)
    RETURNS text AS
$body$
BEGIN
    EXECUTE 'GRANT ALL ON ' || view_names || ' TO ' || quote_ident(rolename) || '';
    RETURN 'EXECUTE GRANT ALL ON ' || view_names || ' TO ' || quote_ident(rolename) || '';
END;
$body$ LANGUAGE plpgsql;

SELECT grant_all_on_all(a.rolname)
FROM pg_roles a
WHERE pg_has_role('openchs', a.oid, 'member');
