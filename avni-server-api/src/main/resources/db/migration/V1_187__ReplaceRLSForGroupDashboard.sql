DROP POLICY IF EXISTS group_dashboard_orgs ON group_dashboard;
select enable_rls_on_tx_table('group_dashboard');
