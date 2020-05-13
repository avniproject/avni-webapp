alter table encounter_type
    add column active boolean not null default true;

alter table program
    add column active boolean not null default true;

alter table subject_type
    add column active boolean not null default true;

alter table concept
    add column active boolean not null default true;
