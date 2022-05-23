alter table individual
    add column profile_picture text;
alter table subject_type
    add column allow_profile_picture boolean not null default false;