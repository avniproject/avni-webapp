INSERT into organisation(id, name, db_user, uuid, media_directory, parent_organisation_id, schema_name)
values (1, 'OpenCHS', 'openchs', '3539a906-dfae-4ec3-8fbb-1b08f35c3884', 'openchs_impl', null, 'openchs')
    ON CONFLICT (uuid) DO NOTHING;

select create_db_user('demo', 'password');

INSERT INTO organisation(id, name, db_user, media_directory, uuid, parent_organisation_id, schema_name)
VALUES (2, 'demo', 'demo', 'demo', 'ae0e4ac4-681d-45f2-8bdd-2b09a5a1a6e5', null , 'demo')
    ON CONFLICT (uuid) DO NOTHING;

INSERT INTO users (id, username, uuid, organisation_id, operating_individual_scope, is_org_admin)
VALUES (2, 'demo-admin', '0e53a72c-a109-49f2-918c-9599b266a585', 2, 'None', true);

INSERT INTO catchment (id, name, uuid, version, organisation_id, type, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES  (2, 'CatchmentY', 'b95cf900-6740-4696-95a1-219db2a8bdcb', 0, 2, 'TypeY', 1, 1, now(), now());
INSERT INTO users (id, username, uuid, organisation_id, operating_individual_scope, is_org_admin, catchment_id)
VALUES (4, 'demo-user', 'f10b5e79-30ef-45ce-a1f5-f1a5101d7c7f', 2, 'ByCatchment', false, 2);


INSERT INTO gender (id, name, uuid, version, organisation_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1, 'Female', 'ad7d1d14-54fd-45a2-86b7-ea329b744484', 1, 1, 1, 1, now(), now());
INSERT INTO gender (id, name, uuid, version, organisation_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (2, 'Male', '840de9fb-e565-4d7d-b751-90335ba20490', 1, 1, 1, 1, now(), now());
INSERT INTO gender (id, name, uuid, version, organisation_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (3, 'Other', '188ad77e-fe46-4328-b0e2-98f3a05c554c', 1, 1, 1, 1, now(), now());



