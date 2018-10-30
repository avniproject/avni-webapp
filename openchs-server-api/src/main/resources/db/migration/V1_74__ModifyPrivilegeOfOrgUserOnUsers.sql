DROP POLICY users_user ON users;
DROP POLICY users_orgs ON users;
CREATE POLICY users_orgs ON users USING ((organisation_id = (select id from organisation where db_user = current_user))) WITH CHECK ((organisation_id = (select id from organisation where db_user = current_user)));
ALTER TABLE users ENABLE ROW LEVEL SECURITY;