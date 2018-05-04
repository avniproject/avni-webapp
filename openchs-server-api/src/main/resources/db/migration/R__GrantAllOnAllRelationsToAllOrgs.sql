CREATE OR REPLACE FUNCTION grant_all_on_all(rolename text)
    RETURNS text AS $body$
BEGIN
    EXECUTE 'GRANT ALL ON ALL TABLES IN SCHEMA public TO ' || quote_ident(rolename) || '' ;
    EXECUTE 'GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO ' || quote_ident(rolename) || '' ;
    EXECUTE 'GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO ' || quote_ident(rolename) || '' ;
    RETURN 'ALL PERMISSIONS GRANTED TO ' || quote_ident(rolename);
END;
$body$ LANGUAGE plpgsql;

SELECT grant_all_on_all(a.rolname) FROM pg_roles a WHERE pg_has_role('openchs', a.oid, 'member');
