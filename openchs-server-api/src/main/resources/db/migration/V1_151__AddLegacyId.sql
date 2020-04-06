alter table individual
    add column legacy_id varchar null;

alter table individual
    add constraint individual_legacy_id_organisation_id_uniq_idx unique (legacy_id, organisation_id);

