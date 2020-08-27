--[Data Extract Report] Registration
SELECT individual.id                                                                       as "Ind.Id",
       individual.address_id                                                               as "Ind.address_id",
       individual.uuid                                                                     as "Ind.uuid",
       individual.first_name                                                               as "Ind.first_name",
       individual.last_name                                                                as "Ind.last_name",
       g.name                                                                              as "Ind.Gender",
       individual.date_of_birth                                                            as "Ind.date_of_birth",
       EXTRACT(year from age(date_of_birth))                                               as "Ind.age_in_years",
       EXTRACT(year FROM age(date_of_birth)) * 12 + EXTRACT(month FROM age(date_of_birth)) as "Ind.age_in_months",
       individual.date_of_birth_verified                                                   as "Ind.date_of_birth_verified",
       individual.registration_date                                                        as "Ind.registration_date",
       individual.facility_id                                                              as "Ind.facility_id",
       individual.registration_location                                                    as "Ind.registration_location",
       individual.subject_type_id                                                          as "Ind.subject_type_id",
       individual.audit_id                                                                 as "Ind.audit_id",
       ost.name                                                                            as "Ind.subject_type_name",
       a.title                                                                             as "Ind.location_name",
       individual.is_voided                                                                as "Ind.is_voided",
       ${selections}
FROM individual individual
       LEFT OUTER JOIN operational_subject_type ost ON ost.subject_type_id = individual.subject_type_id
       LEFT OUTER JOIN gender g ON g.id = individual.gender_id
       LEFT OUTER JOIN address_level a ON individual.address_id = a.id
where ost.uuid = '${operationalSubjectTypeUuid}'
