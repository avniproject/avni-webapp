alter table form
    add column is_timed boolean default false;

alter table form_element_group
    add column start_time integer;

alter table form_element_group
    add column stay_time integer;
