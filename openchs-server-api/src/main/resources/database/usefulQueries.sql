SELECT f.name Form, feg.display FormGroup, fe.name FormElement from form_element fe, form_element_group feg, form f
where feg.form_id = f.id and fe.form_element_group_id = feg.id
order by Form, FormGroup, FormElement;