insert into organisation_config (uuid, organisation_id, settings, created_by_id, created_date_time, last_modified_date_time, last_modified_by_id)
values ('760f3a1b-34c0-4801-a522-6f18133c5544',
        1,
        '{"languages": ["en"]}'::jsonb, (select id from users where username = 'admin'),
        current_timestamp,
        current_timestamp,
        (select id from users where username = 'admin'));

insert into organisation (name, db_user, uuid, media_directory, username_suffix, schema_name)
    VALUES ('example', 'example', '929031e8-e538-4b60-b5e8-b2b1a8bf3090', 'example', 'example', 'example');
select create_db_user('example', 'password');

insert into users (uuid, username, organisation_id, operating_individual_scope, settings, email, phone_number, name, is_org_admin)
VALUES ('2ea084d6-081b-4e9a-9837-d67fad34ca01', 'admin@example', (select id from organisation where name = 'example'), 'None', '{}'::jsonb, 'foo@example.com', '+919090909090', 'Example ka Admin', true);
insert into organisation_config (uuid, organisation_id, settings, created_by_id, created_date_time, last_modified_date_time, last_modified_by_id)
values ('ffd5efdd-9642-4d33-88f3-e4a23e4e6c11',
        (select id from organisation where name = 'example'), '{"languages": ["en"]}'::jsonb, (select id from users where username = 'admin@example'), current_timestamp, current_timestamp, (select id from users where username = 'admin@example'));
