INSERT into organisation_config (uuid, organisation_id, settings, audit_id, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
select uuid_generate_v4(), 1, '{"languages": ["en"]}', 1, 1, 1, current_timestamp, current_timestamp
where not exists ( select 1 from organisation_config where organisation_id = 1);