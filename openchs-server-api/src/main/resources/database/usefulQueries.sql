select *
from form
where organisation_id = 9;
-- VIEW FORM
select
  form.uuid                        AS form_uuid,
  form_element_group.uuid          AS "Group UUID",
  form_element.uuid                as "Element UUID",
  c2.uuid                          as "Concept UUID",
  form.name                        as "Form",
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

-- Catchment and address
select
  catchment.name,
  a.title
from catchment
  inner join catchment_address_mapping m2 on catchment.id = m2.catchment_id
  inner join address_level a on m2.addresslevel_id = a.id
where catchment.organisation_id = 9
order by catchment.id, a.title;


SELECT
  catchment.name,
  address_level.title
FROM catchment, address_level, catchment_address_mapping
WHERE catchment_address_mapping.addresslevel_id = address_level.id AND catchment_address_mapping.catchment_id = catchment.id;

SELECT program_enrolment.*
FROM program_enrolment, program
WHERE program_enrolment.program_id = program.id AND program.name = 'Mother';
SELECT *
FROM concept
WHERE name = 'Obstetrics History';
SELECT *
FROM program_enrolment
WHERE uuid = '7ce1a50f-c672-4019-bc53-8af19e72e337';

SELECT
  pe.uuid uuid,
  c.name,
  ci.due_date,
  ci.completion_date
FROM checklist_item ci, concept c, checklist cl, program_enrolment pe
WHERE ci.concept_id = c.id AND pe.id = cl.program_enrolment_id AND ci.checklist_id = cl.id
ORDER BY pe.uuid, checklist_id, due_date ASC;

SELECT *
FROM individual
WHERE id = 13;


SELECT *
FROM jsonb_to_record('{
  "a": 1,
  "b": "2",
  "c": "bar"
}') AS x(a INT, b TEXT, d TEXT);

SELECT x."07b3e014-cbe4-4998-9055-290194481b20" AS foo
FROM individual, jsonb_to_record(individual.observations) AS x("07b3e014-cbe4-4998-9055-290194481b20" TEXT);


SELECT
  i.name,
  c.name
FROM individual i
  INNER JOIN concept c
    ON i.observations ->> (SELECT uuid
                           FROM concept
                           WHERE name = 'Number of Members in House') = c.uuid;

SELECT pg_typeof(last_modified_date_time)
FROM program_enrolment;
