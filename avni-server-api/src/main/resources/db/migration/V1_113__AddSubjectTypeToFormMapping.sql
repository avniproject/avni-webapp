ALTER TABLE form_mapping
  ADD COLUMN subject_type_id integer references subject_type (id);

update form_mapping
set subject_type_id = (select id
                       from subject_type
                       where name = 'Individual')
where organisation_id not in (select id
                              from organisation
                              where name = 'Dam Desilting Mission');

update form_mapping
set subject_type_id = (select id
                       from subject_type
                       where name = 'Waterbody')
where organisation_id in (select id
                          from organisation
                          where name = 'Dam Desilting Mission');

alter table form_mapping
  alter column subject_type_id set not null;

update audit
set last_modified_date_time = current_timestamp
where id in (select audit_id
             from form_mapping);