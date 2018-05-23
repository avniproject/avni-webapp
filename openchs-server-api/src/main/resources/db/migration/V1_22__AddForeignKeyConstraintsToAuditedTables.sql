DO
$$
DECLARE
  tables_to_alter VARCHAR[] = ARRAY[
    'address_level',
    'catchment',
    'checklist',
    'checklist_item',
    'concept',
    'concept_answer',
    'encounter',
    'encounter_type',
    'form',
    'form_element',
    'form_element_group',
    'form_mapping',
    'gender',
    'individual',
    'operational_encounter_type',
    'operational_program',
    'program',
    'program_encounter',
    'program_enrolment',
    'program_organisation_config',
    'program_outcome',
    'users'
  ];
  t VARCHAR;
BEGIN
  FOREACH t in ARRAY tables_to_alter
    LOOP
      EXECUTE 'ALTER TABLE ONLY ' || t || ' ADD CONSTRAINT ' || t || '_audit FOREIGN KEY(audit_id) REFERENCES audit(id)';
    END LOOP;
END;
$$;