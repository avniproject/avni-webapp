DROP POLICY address_level_type_org ON address_level_type;

DROP POLICY checklist_detail_org ON checklist_detail;
SELECT enable_rls_on_ref_table('checklist_detail');

DROP POLICY checklist_item_detail_org ON checklist_item_detail;
SELECT enable_rls_on_ref_table('checklist_item_detail');

DROP POLICY program_organisation_config_org ON program_organisation_config;
SELECT enable_rls_on_ref_table('program_organisation_config');

DROP POLICY rule_org ON rule;
SELECT enable_rls_on_ref_table('rule');

DROP POLICY rule_dependency_org ON rule_dependency;
SELECT enable_rls_on_ref_table('rule_dependency');

DROP POLICY video_telemetric_orgs ON video_telemetric;
SELECT enable_rls_on_tx_table('video_telemetric');
