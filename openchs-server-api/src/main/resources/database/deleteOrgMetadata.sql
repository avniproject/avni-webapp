-- Doesn't delete the organisation itself
delete from operational_program where organisation_id = :orgId;
delete from program where organisation_id = :orgId;
delete from form_mapping where organisation_id = :orgId;
delete from operational_encounter_type where organisation_id = :orgId;
delete from encounter_type where organisation_id = :orgId;
delete from form_element where organisation_id = :orgId;
delete from form_element_group where organisation_id = :orgId;
delete from form where organisation_id = :orgId;
delete from catchment_address_mapping where catchment_id in (select id from catchment where organisation_id = :orgId);
delete from address_level where organisation_id = :orgId;
delete from catchment where organisation_id = :orgId;
delete from concept_answer where organisation_id = :orgId;
delete from concept where organisation_id = :orgId;
delete from non_applicable_form_element where organisation_id = :orgId;
