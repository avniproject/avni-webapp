alter table program_enrolment
    add column legacy_id varchar null;

alter table program_enrolment
    add constraint program_enrolment_legacy_id_organisation_id_uniq_idx unique (legacy_id, organisation_id);

