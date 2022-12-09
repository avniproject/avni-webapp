alter table program_enrolment alter column address_id drop not null;
alter table program_encounter alter column address_id drop not null;
alter table encounter alter column address_id drop not null;
