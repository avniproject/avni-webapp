SELECT
  f.name Form,
  feg.display FormGroup,
  fe.name FormElement,
  fe.display_order
FROM form_element fe, form_element_group feg, form f
WHERE feg.form_id = f.id AND fe.form_element_group_id = feg.id AND f.name = 'ANC'
ORDER BY feg.display_order, fe.display_order;


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

SELECT *
FROM concept
WHERE uuid = '07b3e014-cbe4-4998-9055-290194481b20';

SELECT
  i.name,
  c.name
FROM individual i
  INNER JOIN concept c
    ON i.observations ->> (SELECT uuid
                           FROM concept
                           WHERE name = 'Number of Members in House') = c.uuid;

SELECT
  i.name,
  c.name
FROM individual i
  INNER JOIN concept c
    ON i.observations ->> (SELECT uuid
                           FROM concept
                           WHERE name = 'Number of Members in House') = c.uuid;


SELECT name
FROM concept
WHERE uuid LIKE '9175b794-7a53-49ec-9b03-fbd58b11f1ec';

SELECT
  individual.name,
  program_enrolment.enrolment_date_time,
  individual.date_of_birth,
  address_level.title,
  date_obs(program_enrolment, 'Last Menstrual Period') LMP,
  date_obs(program_enrolment, 'Estimated Date of Delivery') EDD
FROM program_enrolment, individual, address_level
WHERE program_enrolment.individual_id = individual.id AND individual.address_id = address_level.id AND individual.address_id = address_level.id;

SELECT pg_typeof(last_modified_date_time) FROM program_enrolment;
SELECT uuid, observations FROM program_enrolment;

DELETE from checklist_item;
DELETE from checklist;
DELETE from program_enrolment;
DELETE from individual;
