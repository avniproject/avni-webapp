DROP FUNCTION IF EXISTS enable_rls_on(TEXT);

CREATE OR REPLACE FUNCTION enable_rls_on(tablename TEXT)
  RETURNS TEXT AS $$
DECLARE
  tabl TEXT := quote_ident(tablename);
  polisy TEXT := quote_ident(tablename || '_orgs') || ' ON ' || tabl || ' ';
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS ' || polisy;
  EXECUTE 'CREATE POLICY ' || polisy || '
            USING (organisation_id IN
                 (WITH RECURSIVE list_of_orgs(id, parent_organisation_id)
                      AS (SELECT id, parent_organisation_id
                          FROM organisation
                          WHERE db_user = current_user
                          UNION ALL SELECT o.id,
                                           o.parent_organisation_id
                                    FROM organisation o,
                                         list_of_orgs log
                                    WHERE o.id = log.parent_organisation_id) SELECT id
                                                                             FROM list_of_orgs))
  WITH CHECK ((organisation_id = (select id
                                  from organisation
                                  where db_user = current_user)))';
  EXECUTE 'ALTER TABLE ' || tabl || ' ENABLE ROW LEVEL SECURITY';
  RETURN 'CREATED POLICY ' || polisy;
END
$$
language plpgsql;
