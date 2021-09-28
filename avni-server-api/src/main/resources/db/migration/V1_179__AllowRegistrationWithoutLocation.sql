alter table individual
    alter column address_id drop not null;

alter table subject_type
    add column allow_empty_location boolean not null default false;
