select *
from form
where organisation_id = 9;

-- FORMS, Encounter Types and Operational Encounter Types
select form.name as "Form", form.uuid as "Form UUID", o.name as "Operational Encounter Type", encounter_type.name as "Encounter Type"
from form
inner join form_mapping m2 on form.id = m2.form_id
inner join encounter_type on m2.observations_type_entity_id = encounter_type.id
inner join operational_encounter_type o on encounter_type.id = o.encounter_type_id
  where m2.organisation_id in (1,2)
order by form.name;

-- VIEW FORM
select
  form.uuid                        AS form_uuid,
  form.name                        as "Form",
  form_element_group.uuid          AS "Group UUID",
  form_element.uuid                as "Element UUID",
  c2.uuid                          as "Concept UUID",
  form_element_group.name          as "Group name",
  form_element.name                as "Element Name",
  c2.name                          as "Concept name",
  form_element_group.display_order as "Group Display Order",
  c2.data_type                     as "Concept Data Type"
from form_element
  join form_element_group on form_element.form_element_group_id = form_element_group.id
  join form on form_element_group.form_id = form.id
  join concept c2 on form_element.concept_id = c2.id
where form.id = 24
order by form.name, form_element_group.display_order asc, form_element.display_order asc;

-- VIEW CONCEPT WITH ANSWERS
select
  concept.name,
  a.uuid  AS "Concept Answer UUID",
  c2.uuid as "Answer UUID",
  c2.name as "Answer",
  a.answer_order,
  a.organisation_id
from concept
  inner join concept_answer a on concept.id = a.concept_id
  inner join concept c2 on a.answer_concept_id = c2.id
where concept.name = 'Refer to oral cancer specialist'
order by a.answer_order;

-- Get all the form elements and concept (without answers) for translation
select
  p.name,
  f.name  as FormName
  -- ,fm.entity_id
  -- ,fm.observations_type_entity_id
  -- ,fm.organisation_id
  ,
  feg.name,
  fe.name as "Form Element",
  c2.name as "Concept"
from operational_program p
  inner join form_mapping fm on (fm.entity_id = p.program_id)
  inner join form f on fm.form_id = f.id
  inner join form_element_group feg on feg.form_id = f.id
  inner join form_element fe on fe.form_element_group_id = feg.id
  inner join concept c2 on fe.concept_id = c2.id
where p.organisation_id = 2 and f.form_type != 'ProgramEncounterCancellation' and fe.id not in (select form_element_id
                                                                                                from non_applicable_form_element
                                                                                                where organisation_id = 2)
order by
  p.name
  , f.name
  , feg.display_order asc
  , fe.display_order asc;

-- Get all the REGISTRATION form elements and concept (without answers) for translation
select
  f.name  as FormName
  -- ,fm.entity_id
  -- ,fm.observations_type_entity_id
  -- ,fm.organisation_id
  ,
  feg.name,
  fe.name as "Form Element",
  c2.name as "Concept"
from form f
  inner join form_element_group feg on feg.form_id = f.id
  inner join form_element fe on fe.form_element_group_id = feg.id
  inner join concept c2 on fe.concept_id = c2.id
where f.organisation_id = 9 and f.form_type = 'IndividualProfile'
order by
  f.name
  , feg.display_order asc
  , fe.display_order asc;

-- Organisations
SELECT *
from organisation;

-- Catchment and address
select
  catchment.name,
  a.title
from catchment
  inner join catchment_address_mapping m2 on catchment.id = m2.catchment_id
  inner join address_level a on m2.addresslevel_id = a.id
where catchment.organisation_id = 9
order by catchment.id, a.title;

-- Encounter types
select et.name "EncounterType", oet.name "OrgEncounterType" from operational_encounter_type oet
inner join encounter_type et on oet.encounter_type_id = et.id;

-- Cancel Forms
select
  f2.id as FormMappingId
  ,program.name as Program
  ,encounter_type.name as EncounterType
from form f
  inner join form_mapping f2 on f.id = f2.form_id
  inner join encounter_type on encounter_type.id = f2.observations_type_entity_id
  inner join program on program.id = f2.entity_id
where f2.organisation_id = 2 and f.form_type = 'ProgramEncounterCancellation'
order by
  Program;