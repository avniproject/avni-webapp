alter table form
    drop column is_timed;

alter table form_element_group
    add column is_timed boolean default false;
