ALTER TABLE group_role
    ADD CONSTRAINT group_role_uuid_org_id_key UNIQUE (uuid, organisation_id);
