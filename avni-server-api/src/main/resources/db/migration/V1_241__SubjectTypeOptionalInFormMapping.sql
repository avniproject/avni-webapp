alter table form_mapping alter column subject_type_id drop not null;
alter table form_mapping add column task_type_id int references task_type(id);

alter table form_mapping add constraint subject_type_check
    check ((subject_type_id is not null or task_type_id is not null));
