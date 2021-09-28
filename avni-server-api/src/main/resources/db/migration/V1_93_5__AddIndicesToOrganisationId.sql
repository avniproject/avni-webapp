DROP INDEX IF EXISTS checklist_item_organisation_id__index;
CREATE INDEX checklist_item_organisation_id__index
  ON checklist_item (organisation_id);
DROP INDEX IF EXISTS program_enrolment_organisation_id__index;
CREATE INDEX program_enrolment_organisation_id__index
  ON program_enrolment (organisation_id);
DROP INDEX IF EXISTS operational_encounter_type_organisation_id__index;
CREATE INDEX operational_encounter_type_organisation_id__index
  ON operational_encounter_type (organisation_id);
DROP INDEX IF EXISTS concept_organisation_id__index;
CREATE INDEX concept_organisation_id__index
  ON concept (organisation_id);
DROP INDEX IF EXISTS concept_answer_organisation_id__index;
CREATE INDEX concept_answer_organisation_id__index
  ON concept_answer (organisation_id);
DROP INDEX IF EXISTS form_mapping_organisation_id__index;
CREATE INDEX form_mapping_organisation_id__index
  ON form_mapping (organisation_id);
DROP INDEX IF EXISTS encounter_organisation_id__index;
CREATE INDEX encounter_organisation_id__index
  ON encounter (organisation_id);
DROP INDEX IF EXISTS rule_organisation_id__index;
CREATE INDEX rule_organisation_id__index
  ON rule (organisation_id);
DROP INDEX IF EXISTS program_outcome_organisation_id__index;
CREATE INDEX program_outcome_organisation_id__index
  ON program_outcome (organisation_id);
DROP INDEX IF EXISTS individual_relative_organisation_id__index;
CREATE INDEX individual_relative_organisation_id__index
  ON individual_relative (organisation_id);
DROP INDEX IF EXISTS catchment_organisation_id__index;
CREATE INDEX catchment_organisation_id__index
  ON catchment (organisation_id);
DROP INDEX IF EXISTS non_applicable_form_element_organisation_id__index;
CREATE INDEX non_applicable_form_element_organisation_id__index
  ON non_applicable_form_element (organisation_id);
DROP INDEX IF EXISTS subject_type_organisation_id__index;
CREATE INDEX subject_type_organisation_id__index
  ON subject_type (organisation_id);
DROP INDEX IF EXISTS address_level_type_organisation_id__index;
CREATE INDEX address_level_type_organisation_id__index
  ON address_level_type (organisation_id);
DROP INDEX IF EXISTS operational_program_organisation_id__index;
CREATE INDEX operational_program_organisation_id__index
  ON operational_program (organisation_id);
DROP INDEX IF EXISTS checklist_organisation_id__index;
CREATE INDEX checklist_organisation_id__index
  ON checklist (organisation_id);
DROP INDEX IF EXISTS program_organisation_config_organisation_id__index;
CREATE INDEX program_organisation_config_organisation_id__index
  ON program_organisation_config (organisation_id);
DROP INDEX IF EXISTS individual_relation_gender_mapping_organisation_id__index;
CREATE INDEX individual_relation_gender_mapping_organisation_id__index
  ON individual_relation_gender_mapping (organisation_id);
DROP INDEX IF EXISTS gender_organisation_id__index;
CREATE INDEX gender_organisation_id__index
  ON gender (organisation_id);
DROP INDEX IF EXISTS users_organisation_id__index;
CREATE INDEX users_organisation_id__index
  ON users (organisation_id);
DROP INDEX IF EXISTS location_location_mapping_organisation_id__index;
CREATE INDEX location_location_mapping_organisation_id__index
  ON location_location_mapping (organisation_id);
DROP INDEX IF EXISTS individual_relationship_organisation_id__index;
CREATE INDEX individual_relationship_organisation_id__index
  ON individual_relationship (organisation_id);
DROP INDEX IF EXISTS rule_dependency_organisation_id__index;
CREATE INDEX rule_dependency_organisation_id__index
  ON rule_dependency (organisation_id);
DROP INDEX IF EXISTS operational_subject_type_organisation_id__index;
CREATE INDEX operational_subject_type_organisation_id__index
  ON operational_subject_type (organisation_id);
DROP INDEX IF EXISTS form_element_organisation_id__index;
CREATE INDEX form_element_organisation_id__index
  ON form_element (organisation_id);
DROP INDEX IF EXISTS program_organisation_id__index;
CREATE INDEX program_organisation_id__index
  ON program (organisation_id);
DROP INDEX IF EXISTS address_level_organisation_id__index;
CREATE INDEX address_level_organisation_id__index
  ON address_level (organisation_id);
DROP INDEX IF EXISTS encounter_type_organisation_id__index;
CREATE INDEX encounter_type_organisation_id__index
  ON encounter_type (organisation_id);
DROP INDEX IF EXISTS individual_relation_organisation_id__index;
CREATE INDEX individual_relation_organisation_id__index
  ON individual_relation (organisation_id);
DROP INDEX IF EXISTS video_telemetric_organisation_id__index;
CREATE INDEX video_telemetric_organisation_id__index
  ON video_telemetric (organisation_id);
DROP INDEX IF EXISTS video_organisation_id__index;
CREATE INDEX video_organisation_id__index
  ON video (organisation_id);
DROP INDEX IF EXISTS individual_relationship_type_organisation_id__index;
CREATE INDEX individual_relationship_type_organisation_id__index
  ON individual_relationship_type (organisation_id);
DROP INDEX IF EXISTS individual_organisation_id__index;
CREATE INDEX individual_organisation_id__index
  ON individual (organisation_id);
DROP INDEX IF EXISTS checklist_item_detail_organisation_id__index;
CREATE INDEX checklist_item_detail_organisation_id__index
  ON checklist_item_detail (organisation_id);
DROP INDEX IF EXISTS form_organisation_id__index;
CREATE INDEX form_organisation_id__index
  ON form (organisation_id);
DROP INDEX IF EXISTS program_rule_organisation_id__index;
CREATE INDEX program_rule_organisation_id__index
  ON program_rule (organisation_id);
DROP INDEX IF EXISTS facility_organisation_id__index;
CREATE INDEX facility_organisation_id__index
  ON facility (organisation_id);
DROP INDEX IF EXISTS user_facility_mapping_organisation_id__index;
CREATE INDEX user_facility_mapping_organisation_id__index
  ON user_facility_mapping (organisation_id);
DROP INDEX IF EXISTS checklist_detail_organisation_id__index;
CREATE INDEX checklist_detail_organisation_id__index
  ON checklist_detail (organisation_id);
DROP INDEX IF EXISTS form_element_group_organisation_id__index;
CREATE INDEX form_element_group_organisation_id__index
  ON form_element_group (organisation_id);
DROP INDEX IF EXISTS program_encounter_organisation_id__index;
CREATE INDEX program_encounter_organisation_id__index
  ON program_encounter (organisation_id);