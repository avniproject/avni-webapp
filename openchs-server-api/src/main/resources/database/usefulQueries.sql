SELECT f.name Form, feg.display FormGroup, fe.name FormElement from form_element fe, form_element_group feg, form f
where feg.form_id = f.id and fe.form_element_group_id = feg.id
order by Form, FormGroup, FormElement;


SELECT catchment.name, address_level.title from catchment, address_level, catchment_address_mapping WHERE catchment_address_mapping.addresslevel_id = address_level.id AND catchment_address_mapping.catchment_id = catchment.id;

SELECT * from program_enrolment;