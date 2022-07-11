alter table individual add column middle_name varchar(255) null;

alter table subject_type
    add column valid_middle_name_regex text,
    add column valid_middle_name_description_key text;

alter table subject_type
    add column allow_middle_name boolean default false;
