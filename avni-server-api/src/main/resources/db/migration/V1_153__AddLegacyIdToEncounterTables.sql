alter table program_encounter
    add column legacy_id varchar null;

alter table program_encounter
    add constraint program_encounter_legacy_id_organisation_id_uniq_idx unique (legacy_id, organisation_id);

alter table encounter
    add column legacy_id varchar null;

alter table encounter
    add constraint encounter_legacy_id_organisation_id_uniq_idx unique (legacy_id, organisation_id);

