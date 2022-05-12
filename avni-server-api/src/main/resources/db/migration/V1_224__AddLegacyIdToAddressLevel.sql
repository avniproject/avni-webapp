alter table address_level
    add column legacy_id varchar null;

alter table address_level
    add constraint address_level_legacy_id_organisation_id_uniq_idx unique (legacy_id, organisation_id);
