--[Data Extract Report] Registration

SELECT individual.id                     as "Ind.Id",
       individual.address_id             as "Ind.address_id",
       individual.uuid                   as "Ind.uuid",
       individual.first_name             as "Ind.first_name",
       individual.last_name              as "Ind.last_name",
       g.name                            as "Ind.Gender",
       individual.date_of_birth          as "Ind.date_of_birth",
       individual.date_of_birth_verified as "Ind.date_of_birth_verified",
       individual.registration_date      as "Ind.registration_date",
       individual.facility_id            as "Ind.facility_id",
       a.title                           as "Ind.Area",
       c2.name                           as "Ind.Catchment",
       individual.is_voided              as "Ind.is_voided",
       ${selections}
FROM individual individual
       LEFT OUTER JOIN gender g ON g.id = individual.gender_id
       LEFT OUTER JOIN address_level a ON individual.address_id = a.id
       LEFT OUTER JOIN virtual_catchment_address_mapping_table m2 ON a.id = m2.addresslevel_id
       LEFT OUTER JOIN catchment c2 ON m2.catchment_id = c2.id
WHERE c2.name not ilike '%master%'
