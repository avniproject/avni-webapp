-- These views will be used in the metabase questions and dashboards. The name of columns in the view cannot be changed in non-sql questions, hence they are being named like that. Metabase allows choosing another column for displaying foreign-key ids. For example: Individual will be the display for table header and we will display the "name" column value there.
-- We want retain the ability to display an entity, by letting the user click on the entity - hence in some case id field left if there is no intuitive replacement for it, for example enrolment_id.
-- The dates pose a problem, one cannot display the dates as 'DD-Mon-YYYY', which will be intuitive, because for that requires it to be converted to_char. But if we do that the user and dashboards will not be able to do date based filtering from metabase.

DROP VIEW mother_program_enrolments;
CREATE OR REPLACE VIEW mother_program_enrolments AS
  SELECT
    individual.id                                               individual,
    date_trunc('day', program_enrolment.enrolment_date_time)    enrolment_date,
    individual.date_of_birth                                    date_of_birth,
    address_level.id                                            address,
    date_obs(program_enrolment, 'Last Menstrual Period')        LMP,
    date_obs(program_enrolment, 'Estimated Date of Delivery')   EDD,
    coded_obs_exists(program_enrolment, 'High Risk Conditions') is_high_risk,
    coded_obs(program_enrolment, 'High Risk Conditions')        high_risk_conditions,
    count(program_encounter)                                    number_of_visits,
    sum(is_overdue_visit(program_encounter))                    number_of_overdue_visits
  FROM program_enrolment
    INNER JOIN individual ON program_enrolment.individual_id = individual.id
    INNER JOIN address_level ON address_level.id = individual.address_id
    LEFT OUTER JOIN program_encounter ON program_enrolment.id = program_encounter.program_enrolment_id
  GROUP BY program_enrolment.id, individual.id, address_level.id
  ORDER BY address, individual;

DROP VIEW mother_program_encounters;
CREATE OR REPLACE VIEW mother_program_encounters AS
  SELECT
    individual.id                                               individual,
    individual.date_of_birth                                    date_of_birth,
    address_level.id                                            address,
    program_enrolment.id                                        enrolment_id,
    program_enrolment.enrolment_date_time                       enrolment_date,
    date_obs(program_enrolment, 'Last Menstrual Period')        LMP,
    date_obs(program_enrolment, 'Estimated Date of Delivery')   EDD,
    program_encounter.id                                        visit,
    date_trunc('day', program_encounter.scheduled_date_time)    scheduled_visit_date,
    encounter_type.id                                           visit_type,
    program_encounter.name                                      visit_name,
    coded_obs_exists(program_enrolment, 'High Risk Conditions') is_high_risk,
    coded_obs(program_enrolment, 'High Risk Conditions')        high_risk_conditions
  FROM program_encounter
    INNER JOIN program_enrolment ON program_encounter.program_enrolment_id = program_enrolment.id
    INNER JOIN encounter_type ON program_encounter.encounter_type_id = encounter_type.id
    INNER JOIN individual ON program_enrolment.individual_id = individual.id
    INNER JOIN address_level ON address_level.id = individual.address_id;