alter table subject_type
    add column valid_first_name_regex text,
    add column valid_first_name_description_key text,
    add column valid_last_name_regex text,
    add column valid_last_name_description_key text;
