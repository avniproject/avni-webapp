CREATE OR REPLACE FUNCTION grant_permission_on_account_admin(rolename text)
    RETURNS text AS
$body$
BEGIN
    EXECUTE 'GRANT ALL ON TABLE account_admin TO ' || quote_ident(rolename) || '';
    RETURN 'PERMISSIONS GRANTED FOR account_admin TO ' || quote_ident(rolename);
END;
$body$ LANGUAGE plpgsql;

SELECT grant_permission_on_account_admin(a.rolname)
FROM pg_roles a
WHERE pg_has_role('openchs', a.oid, 'member') AND a.rolname <> 'openchs';

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_user ON users;
CREATE POLICY users_user ON users USING (organisation_id in (select id from organisation where db_user in ('openchs', current_user))
                                         OR
                                         id in (select admin_id from account_admin where account_id in (select account_id from organisation where db_user in ('openchs', current_user)))
                                         OR
                                         organisation_id IN (SELECT organisation_id from organisation_group_organisation))
    WITH CHECK ( organisation_id in (select id from organisation where db_user in ('openchs', current_user)));