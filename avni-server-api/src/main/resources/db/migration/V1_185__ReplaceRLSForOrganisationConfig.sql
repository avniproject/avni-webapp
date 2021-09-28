DROP POLICY IF EXISTS organisation_config_orgs ON organisation_config;

select enable_rls_on_ref_table('organisation_config');
