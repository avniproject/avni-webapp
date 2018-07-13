delete from program_encounter where organisation_id = :orgId and organisation_id > 1;
delete from checklist_item where organisation_id = :orgId and organisation_id > 1;
delete from checklist where organisation_id = :orgId and organisation_id > 1;
delete from program_enrolment where organisation_id = :orgId and organisation_id > 1;
delete from individual_relationship where organisation_id = :orgId and organisation_id > 1;
delete from individual_relationship_type where organisation_id = :orgId and organisation_id > 1;
delete from individual_relative where organisation_id = :orgId and organisation_id > 1;
delete from encounter where organisation_id = :orgId and organisation_id > 1;
delete from individual where organisation_id = :orgId and organisation_id > 1;
delete from catchment_address_mapping where addresslevel_id in (select id from address_level where organisation_id = :orgId and organisation_id > 1);
delete from address_level where organisation_id = :orgId and organisation_id > 1;
delete from catchment where organisation_id = :orgId and organisation_id > 1;
delete from concept_answer where organisation_id = :orgId and organisation_id > 1;
delete from operational_encounter_type where organisation_id = :orgId and organisation_id > 1;
delete from encounter_type where organisation_id = :orgId and organisation_id > 1;
delete from non_applicable_form_element where organisation_id = :orgId and organisation_id > 1;
delete from form_element where organisation_id = :orgId and organisation_id > 1;
delete from individual_relation_gender_mapping where organisation_id = :orgId and organisation_id > 1;
delete from concept where organisation_id = :orgId and organisation_id > 1;
delete from form_element_group where organisation_id = :orgId and organisation_id > 1;
delete from form_mapping where organisation_id = :orgId and organisation_id > 1;
delete from rule where organisation_id = :orgId and organisation_id > 1;
delete from form where organisation_id = :orgId and organisation_id > 1;
delete from individual_relation where organisation_id = :orgId and organisation_id > 1;
delete from operational_program where organisation_id = :orgId and organisation_id > 1;
delete from program_organisation_config where organisation_id = :orgId and organisation_id > 1;
delete from program where organisation_id = :orgId and organisation_id > 1;
delete from program_outcome where organisation_id = :orgId and organisation_id > 1;
delete from rule_dependency where organisation_id = :orgId and organisation_id > 1;
delete from users where organisation_id = :orgId and organisation_id > 1;
delete from organisation where id = :orgId and id > 1;

---- tables ignored
-- schema_version
-- audit
-- gender
