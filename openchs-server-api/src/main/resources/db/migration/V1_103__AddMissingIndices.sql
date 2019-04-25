alter table address_level_type
  add constraint address_level_type_name_organisation_id_unique unique (name, organisation_id);
alter table catchment
  add constraint catchment_name_organisation_id_unique unique (name, organisation_id);
alter table catchment_address_mapping
  add constraint catchment_address_mapping_catchment_id_address_level_id_unique unique (catchment_id, addresslevel_id);
alter table checklist
  add constraint checklist_checklist_detail_id_program_enrolment_id_unique unique (checklist_detail_id, program_enrolment_id);
alter table operational_encounter_type
  add constraint operational_encounter_type_encounter_type_organisation_id_unique unique (encounter_type_id, organisation_id);
alter table operational_program
  add constraint operational_program_program_id_organisation_id_unique unique (program_id, organisation_id);
alter table program_encounter
  add constraint program_encounter_cannot_cancel_and_perform_check check (encounter_date_time is null or
                                                                          cancel_date_time is null);
alter table program_encounter
  add constraint program_encounter_ensure_scheduling_is_complete check (
  (earliest_visit_date_time is null and max_visit_date_time is null) or
  (earliest_visit_date_time is not null and max_visit_date_time is not null));
alter table concept_answer
  add constraint concept_answer_concept_id_answer_concept_id_organisation_id_unique unique (concept_id, answer_concept_id, organisation_id);
create unique index users_username_idx
  on users (username);