SELECT f.name Form, feg.display FormGroup, fe.name FormElement, fe.display_order from form_element fe, form_element_group feg, form f
where feg.form_id = f.id and fe.form_element_group_id = feg.id AND f.name = 'ANC'
order by feg.display_order, fe.display_order;


SELECT catchment.name, address_level.title from catchment, address_level, catchment_address_mapping WHERE catchment_address_mapping.addresslevel_id = address_level.id AND catchment_address_mapping.catchment_id = catchment.id;

SELECT program_enrolment.* from program_enrolment, program WHERE program_enrolment.program_id = program.id and program.name = 'Mother';
select * from concept where name = 'Obstetrics History';
SELECT * from program_enrolment where uuid = '7ce1a50f-c672-4019-bc53-8af19e72e337';

SELECT ci.checklist_id, c.name, ci.due_date from checklist_item ci, concept c WHERE ci.concept_id = c.id ORDER BY checklist_id, due_date ASC;

SELECT * from individual WHERE id = 13;

