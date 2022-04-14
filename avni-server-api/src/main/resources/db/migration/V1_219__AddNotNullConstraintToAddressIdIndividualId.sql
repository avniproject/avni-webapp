alter table encounter alter column address_id set not null;
alter table program_enrolment alter column address_id set not null;
alter table program_encounter alter column individual_id set not null;
alter table program_encounter alter column address_id set not null;
alter table group_subject alter column group_subject_address_id set not null;
alter table group_subject alter column member_subject_address_id set not null;
