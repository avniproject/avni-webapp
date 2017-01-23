select deleteMetaDataCascade('encounter_form');

drop FUNCTION insert_form_element_for_concept_with_answers(formElementName VARCHAR(70), formElementUUID VARCHAR(70), displayOrder NUMERIC, isMandatory BOOLEAN, formElementGroupId BIGINT, conceptName VARCHAR(70), conceptUUID VARCHAR(70), answer_concepts JSON);

INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1, 2, '{"a":1,"b":2}'::json->>'b', 'f6e8ada2-0a35-48ab-bda1-2a58bdf1fa54', 1, 1, 1, current_timestamp, current_timestamp);

select ('{"a":1,"b":2}'::json->>'b')::SMALLINT;