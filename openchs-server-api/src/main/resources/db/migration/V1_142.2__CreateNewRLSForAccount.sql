CREATE VIEW org_ids WITH (security_barrier) AS
    WITH RECURSIVE list_of_orgs(id, parent_organisation_id)
                       AS (SELECT id, parent_organisation_id
                           FROM organisation
                           WHERE db_user = current_user
                           UNION ALL
                           SELECT o.id,
                                  o.parent_organisation_id
                           FROM organisation o,
                                list_of_orgs log
                           WHERE o.id = log.parent_organisation_id)
    SELECT id
    FROM list_of_orgs;

ALTER TABLE organisation_group ENABLE ROW LEVEL SECURITY;
CREATE POLICY organisation_group_policy on organisation_group using (current_user = db_user);
ALTER TABLE organisation_group_organisation ENABLE ROW LEVEL SECURITY;
CREATE POLICY organisation_group_organisation_policy on organisation_group_organisation using (organisation_group_id IN (SELECT id from organisation_group WHERE db_user = current_user));
ALTER TABLE organisation ENABLE ROW LEVEL SECURITY;
CREATE POLICY organisation_policy on organisation USING (current_user IN ('openchs', 'openchs_impl') OR id IN (select id from org_ids) OR id IN (SELECT organisation_id from organisation_group_organisation));


drop function if exists enable_rls_on_ref_table(text);

create function enable_rls_on_ref_table(tablename text) returns text
    language plpgsql
as
$$
DECLARE
    tabl   TEXT := quote_ident(tablename);
    polisy TEXT := quote_ident(tablename || '_orgs') || ' ON ' || tabl || ' ';
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS ' || polisy;
    EXECUTE 'CREATE POLICY ' || polisy || '
            USING (organisation_id IN (SELECT id FROM org_ids UNION SELECT organisation_id from organisation_group_organisation)
            OR organisation_id IN (SELECT organisation_id from organisation_group_organisation))
  WITH CHECK ((organisation_id = (select id
                                  from organisation
                                  where db_user = current_user)))';
    EXECUTE 'ALTER TABLE ' || tabl || ' ENABLE ROW LEVEL SECURITY';
    RETURN 'CREATED POLICY ' || polisy;
END
$$;

alter function enable_rls_on_ref_table(text) owner to openchs;

drop function if exists enable_rls_on_tx_table(text);

create function enable_rls_on_tx_table(tablename text) returns text
    language plpgsql
as
$$
DECLARE
    tabl   TEXT := quote_ident(tablename);
    polisy TEXT := quote_ident(tablename || '_orgs') || ' ON ' || tabl || ' ';
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS ' || polisy;
    EXECUTE 'CREATE POLICY ' || polisy || '
            USING ((organisation_id = (select id from organisation where db_user = current_user)
            OR organisation_id IN (SELECT organisation_id from organisation_group_organisation)))
    WITH CHECK ((organisation_id = (select id from organisation where db_user = current_user)))';
    EXECUTE 'ALTER TABLE ' || tabl || ' ENABLE ROW LEVEL SECURITY';
    RETURN 'CREATED POLICY ' || polisy;
END
$$;

alter function enable_rls_on_tx_table(text) owner to openchs;



select enable_rls_on_ref_table('facility'),
       enable_rls_on_ref_table('gender'),
       enable_rls_on_ref_table('individual_relation'),
       enable_rls_on_ref_table('individual_relation_gender_mapping'),
       enable_rls_on_ref_table('individual_relationship_type'),
       enable_rls_on_ref_table('location_location_mapping'),
       enable_rls_on_ref_table('user_facility_mapping'),
       enable_rls_on_ref_table('translation'),
       enable_rls_on_ref_table('organisation_config'),
       enable_rls_on_ref_table('address_level_type'),
       enable_rls_on_ref_table('identifier_source'),
       enable_rls_on_ref_table('checklist_detail'),
       enable_rls_on_ref_table('checklist_item_detail'),
       enable_rls_on_ref_table('program_organisation_config'),
       enable_rls_on_ref_table('rule'),
       enable_rls_on_ref_table('rule_dependency'),
       enable_rls_on_ref_table('address_level'),
       enable_rls_on_ref_table('catchment'),
       enable_rls_on_ref_table('concept'),
       enable_rls_on_ref_table('concept_answer'),
       enable_rls_on_ref_table('encounter_type'),
       enable_rls_on_ref_table('form'),
       enable_rls_on_ref_table('form_element'),
       enable_rls_on_ref_table('form_element_group'),
       enable_rls_on_ref_table('form_mapping'),
       enable_rls_on_ref_table('program'),
       enable_rls_on_ref_table('program_outcome'),
       enable_rls_on_ref_table('operational_encounter_type'),
       enable_rls_on_ref_table('operational_program'),
       enable_rls_on_ref_table('subject_type'),
       enable_rls_on_ref_table('video'),
       enable_rls_on_ref_table('non_applicable_form_element'),
       enable_rls_on_ref_table('translation'),
       enable_rls_on_ref_table('operational_subject_type');


select enable_rls_on_tx_table('organisation_config'),
       enable_rls_on_tx_table('sync_telemetry'),
       enable_rls_on_tx_table('individual_relationship'),
       enable_rls_on_tx_table('rule_failure_telemetry'),
       enable_rls_on_tx_table('video_telemetric'),
       enable_rls_on_tx_table('identifier_assignment'),
       enable_rls_on_tx_table('identifier_user_assignment'),
       enable_rls_on_tx_table('checklist'),
       enable_rls_on_tx_table('checklist_item'),
       enable_rls_on_tx_table('encounter'),
       enable_rls_on_tx_table('program_encounter'),
       enable_rls_on_tx_table('program_enrolment'),
       enable_rls_on_tx_table('individual');