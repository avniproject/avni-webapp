DROP FUNCTION IF EXISTS enable_rls_on_ref_table(TEXT);
CREATE OR REPLACE FUNCTION enable_rls_on_ref_table(tablename TEXT)
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

DROP FUNCTION IF EXISTS enable_rls_on_tx_table(TEXT);
CREATE OR REPLACE FUNCTION enable_rls_on_tx_table(tablename TEXT)
  RETURNS TEXT AS $$
DECLARE
  tabl TEXT := quote_ident(tablename);
  polisy TEXT := quote_ident(tablename || '_orgs') || ' ON ' || tabl || ' ';
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS ' || polisy;
  EXECUTE 'CREATE POLICY ' || polisy || '
            USING ((organisation_id = (select id from organisation where db_user = current_user)))
            WITH CHECK ((organisation_id = (select id from organisation where db_user = current_user)))';
  EXECUTE 'ALTER TABLE ' || tabl || ' ENABLE ROW LEVEL SECURITY';
  RETURN 'CREATED POLICY ' || polisy;
END
$$
language plpgsql;

select enable_rls_on_ref_table('facility'),
  enable_rls_on_ref_table('gender'),
  enable_rls_on_ref_table('individual_relation'),
  enable_rls_on_ref_table('individual_relation_gender_mapping'),
  enable_rls_on_ref_table('individual_relationship_type'),
  enable_rls_on_ref_table('location_location_mapping'),
  enable_rls_on_ref_table('program_rule'),
  enable_rls_on_ref_table('user_facility_mapping');

select enable_rls_on_tx_table('individual_relationship');
