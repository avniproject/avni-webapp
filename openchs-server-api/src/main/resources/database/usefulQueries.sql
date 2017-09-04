SELECT
  f.name      Form,
  feg.display FormGroup,
  fe.name     FormElement,
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

