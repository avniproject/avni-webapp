DROP VIEW IF EXISTS all_form_element_groups;
DROP VIEW IF EXISTS all_form_elements;
DROP VIEW IF EXISTS all_concepts;
DROP VIEW IF EXISTS all_concept_answers;
DROP VIEW IF EXISTS all_forms;
DROP VIEW IF EXISTS all_operational_encounter_types;
DROP VIEW IF EXISTS all_encounter_types;
DROP VIEW IF EXISTS all_operational_programs;
DROP VIEW IF EXISTS all_programs;

CREATE VIEW all_forms as
  select distinct
    x.organisation_id as organisation_id,
    x.form_id         as form_id,
    x.form_name       as form_name
  from (select
          form.id            as form_id,
          form.name          as form_name,
          m2.organisation_id as organisation_id
        from form
          inner join form_mapping m2 on form.id = m2.form_id
        where not form.is_voided or not m2.is_voided

        union

        select
          form.id             as form_id,
          form.name           as form_name,
          oet.organisation_id as organisation_id
        from form
          inner join form_mapping m2 on form.id = m2.form_id and m2.organisation_id = 1
          inner join operational_encounter_type oet on oet.encounter_type_id = m2.observations_type_entity_id
        where not form.is_voided or not m2.is_voided or not oet.is_voided

        union

        select
          form.id            as form_id,
          form.name          as form_name,
          op.organisation_id as organisation_id
        from form
          inner join form_mapping m2 on form.id = m2.form_id and m2.organisation_id = 1
          inner join operational_program op on op.program_id = m2.entity_id
        where not form.is_voided or not m2.is_voided or not op.is_voided
       ) as x;

create view all_form_element_groups as
  select distinct
    all_forms.organisation_id as organisation_id,
    form_element_group.name   as form_element_group_name
  from form_element_group
    inner join form on form_element_group.form_id = form.id
    inner join all_forms on all_forms.form_id = form.id
  where not form_element_group.is_voided or not form.is_voided;

create view all_form_elements as
  select distinct
    all_forms.organisation_id as organisation_id,
    form_element.name         as form_element_name
  from form_element
    inner join form_element_group on form_element.form_element_group_id = form_element_group.id
    inner join form on form_element_group.form_id = form.id
    inner join all_forms on all_forms.form_id = form.id
  where not form_element.is_voided or not form_element_group.is_voided;

create view all_concepts as
  select distinct
    all_forms.organisation_id as organisation_id,
    c2.name                   as concept_name
  from form_element
    inner join form_element_group on form_element.form_element_group_id = form_element_group.id
    inner join form on form_element_group.form_id = form.id
    inner join concept c2 on form_element.concept_id = c2.id
    inner join all_forms on all_forms.form_id = form.id
  where not form_element.is_voided or not form_element_group.is_voided or not form.is_voided or not c2.is_voided;

create view all_concept_answers as
  select distinct
    all_forms.organisation_id as organisation_id,
    c3.name                   as answer_concept_name
  from form_element
    inner join form_element_group on form_element.form_element_group_id = form_element_group.id
    inner join form on form_element_group.form_id = form.id
    inner join concept c2 on form_element.concept_id = c2.id
    inner join concept_answer a on c2.id = a.concept_id
    inner join concept c3 on a.answer_concept_id = c3.id
    inner join all_forms on all_forms.form_id = form.id
  where not form_element.is_voided or not form_element_group.is_voided or not form.is_voided or not c2.is_voided or not c2.is_voided or not c3.is_voided;

create view all_operational_encounter_types as
  select distinct
    operational_encounter_type.organisation_id as organisation_id,
    operational_encounter_type.name            as operational_encounter_type_name
  from operational_encounter_type
    inner join encounter_type et on operational_encounter_type.encounter_type_id = et.id
  where not operational_encounter_type.is_voided or not et.is_voided;

create view all_encounter_types as
  select distinct
    operational_encounter_type.organisation_id as organisation_id,
    et.name                                    as encounter_type_name
  from operational_encounter_type
    inner join encounter_type et on operational_encounter_type.encounter_type_id = et.id
  where not operational_encounter_type.is_voided or not et.is_voided;

create view all_operational_programs as
  select distinct
    operational_program.organisation_id as organisation_id,
    operational_program.name            as operational_program_name
  from operational_program
    inner join program p on p.id = operational_program.program_id
  where not operational_program.is_voided or not p.is_voided;

create view all_programs as
  select distinct
    operational_program.organisation_id as organisation_id,
    p.name                              as program_name
  from operational_program
    inner join program p on p.id = operational_program.program_id
  where not operational_program.is_voided or not p.is_voided;

create view all_