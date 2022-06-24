create index encounter_legacy_id_index
    on encounter (legacy_id);
create index individual_legacy_id_index
    on individual (legacy_id);
create index program_encounter_legacy_id_index
    on program_encounter (legacy_id);
create index program_enrolment_legacy_id_index
    on program_enrolment (legacy_id);