alter table organisation_config
    add column export_settings jsonb default '{}'::jsonb;