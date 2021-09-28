DELETE FROM program_encounter
WHERE organisation_id = :orgId AND organisation_id > 1;
DELETE FROM checklist_item
WHERE organisation_id = :orgId AND organisation_id > 1;
DELETE FROM checklist
WHERE organisation_id = :orgId AND organisation_id > 1;
DELETE FROM program_enrolment
WHERE organisation_id = :orgId AND organisation_id > 1;
DELETE FROM individual_relationship
WHERE organisation_id = :orgId AND organisation_id > 1;
DELETE FROM encounter
WHERE organisation_id = :orgId AND organisation_id > 1;
DELETE FROM individual
WHERE organisation_id = :orgId AND organisation_id > 1;
DELETE FROM users
WHERE organisation_id = :orgId AND organisation_id > 1;

SELECT setval('program_encounter_id_seq', coalesce((SELECT max(id) + 1
                                                    FROM program_encounter), 1), FALSE);
SELECT setval('checklist_item_id_seq', coalesce((SELECT max(id) + 1
                                                 FROM checklist_item), 1), FALSE);
SELECT setval('checklist_id_seq', coalesce((SELECT max(id) + 1
                                            FROM checklist), 1), FALSE);
SELECT setval('program_enrolment_id_seq', coalesce((SELECT max(id) + 1
                                                    FROM program_enrolment), 1), FALSE);
SELECT setval('individual_relationship_id_seq', coalesce((SELECT max(id) + 1
                                                          FROM individual_relationship), 1), FALSE);
SELECT setval('encounter_id_seq', coalesce((SELECT max(id) + 1
                                            FROM encounter), 1), FALSE);
SELECT setval('individual_id_seq', coalesce((SELECT max(id) + 1
                                             FROM individual), 1), FALSE);
SELECT setval('users_id_seq', coalesce((SELECT max(id) + 1
                                        FROM users), 1), FALSE);
---- tables ignored
-- schema_version
-- audit
-- gender
