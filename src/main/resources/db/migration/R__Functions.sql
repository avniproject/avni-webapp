DROP FUNCTION IF EXISTS openchs.create_form( CHARACTER VARYING, CHARACTER VARYING, CHARACTER VARYING, BIGINT, CHARACTER VARYING, CHARACTER VARYING);
DROP FUNCTION IF EXISTS openchs.create_form_element(CHARACTER VARYING, CHARACTER VARYING, SMALLINT, BOOLEAN, BIGINT, BIGINT, JSON);
DROP FUNCTION IF EXISTS openchs.create_form_element_for_concept_with_answers(VARCHAR, VARCHAR, NUMERIC, BOOLEAN, BIGINT, JSON, VARCHAR, JSON);
DROP FUNCTION IF EXISTS openchs.create_form_element_for_concept(VARCHAR, VARCHAR, NUMERIC, BOOLEAN, BIGINT, JSON, VARCHAR, VARCHAR);

CREATE OR REPLACE FUNCTION create_concept(name VARCHAR(70), data_type VARCHAR(20), uuid VARCHAR(70))
  RETURNS BIGINT AS $$
DECLARE conceptid BIGINT;
BEGIN
  INSERT INTO concept (id, name, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES (DEFAULT, name, data_type, uuid, 1, 1, 1, current_timestamp, current_timestamp)  RETURNING id into conceptid;

  raise notice 'Created concept with id: %, name: %', conceptid, name;

  RETURN conceptid;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION create_concept_and_answers(name VARCHAR(70), uuid VARCHAR(70), answers JSON)
  RETURNS BIGINT AS $$
  DECLARE answerConceptId BIGINT;
  DECLARE conceptId BIGINT;
  DECLARE answer JSON;
BEGIN
  conceptId = create_concept(name, 'Coded', uuid);

  FOR answer IN SELECT *
                FROM json_array_elements(answers)
  LOOP
    INSERT INTO concept (name, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
    VALUES (answer->>'name', 'N/A', answer->>'uuid', 1, 1, 1, current_timestamp, current_timestamp) RETURNING id into answerConceptId;

    INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
    VALUES (conceptId, answerConceptId, (answer->>'answerOrder')::SMALLINT, answer->>'uuid', 1, 1, 1, current_timestamp, current_timestamp);
  END LOOP;

  raise notice 'Created concept and answers for concept id: %, name: %', conceptid, name;

  RETURN conceptId;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION create_form(form VARCHAR(70), formUUID VARCHAR(70), formType VARCHAR(70), entityId BIGINT, formMappingUUID VARCHAR(70), encounterTypeUUID VARCHAR(70))
  RETURNS BIGINT AS $$
  DECLARE formId BIGINT;
  DECLARE encounterTypeId BIGINT;
BEGIN
  INSERT INTO form (name, form_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES (form, formType, formUUID, 1, 1, 1, current_timestamp, current_timestamp) RETURNING id INTO formId;

  IF encounterTypeUUID IS NOT NULL THEN
    INSERT INTO encounter_type (name, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
      VALUES (form, encounterTypeUUID, 1, 1, 1, current_timestamp, current_timestamp) RETURNING id INTO encounterTypeId;
  END IF;

  INSERT INTO form_mapping (form_id, entity_id, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time, observations_type_entity_id)
  VALUES (formId, entityId, formMappingUUID, 1, 1, 1, current_timestamp, current_timestamp, encounterTypeId);

  raise notice 'Created form with id: %, name: %', formId, form;

  RETURN formId;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION create_form_element_group(name VARCHAR(70), uuid VARCHAR(70), displayOrder SMALLINT, formID BIGINT)
  RETURNS BIGINT AS $$
DECLARE formElementGroupId BIGINT;
BEGIN
  INSERT INTO form_element_group (id, name, form_id, display_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES (DEFAULT, name, formID, displayOrder, uuid, 1, 1, 1, current_timestamp, current_timestamp) RETURNING id INTO formElementGroupId;

  raise notice 'Created form_element_group with id: %, name: %', formElementGroupId, name;

  RETURN formElementGroupId;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_form_element(formElementName VARCHAR(70), formElementUUID VARCHAR(70), displayOrder SMALLINT, isMandatory BOOLEAN, formElementGroupId BIGINT, conceptId BIGINT, keyValues JSON)
  RETURNS BIGINT AS $$
DECLARE formElementId BIGINT;
BEGIN
  IF conceptId = 0 THEN
    SELECT id INTO conceptId from openchs.concept WHERE name = formElementName;
  END IF;
  INSERT INTO openchs.form_element (id, name, display_order, is_mandatory, concept_id, is_used_in_summary, is_generated, form_element_group_id, key_values, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES (DEFAULT, formElementName, displayOrder, isMandatory, conceptId, FALSE, FALSE, formElementGroupId, keyValues, formElementUUID, 1, 1, 1, current_timestamp, current_timestamp) RETURNING id INTO formElementId;

  raise notice 'Created form_element with id: %, name: %', formElementId, formElementName;

  RETURN formElementId;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_form_element_for_concept_with_answers(formElementName VARCHAR(70), formElementUUID VARCHAR(70), displayOrder SMALLINT, isMandatory BOOLEAN, formElementGroupId BIGINT, keyValues JSON, conceptUUID VARCHAR(70), answer_concepts JSON)
  RETURNS BIGINT AS $$
  DECLARE conceptId BIGINT;
  DECLARE formElementId BIGINT;
BEGIN
  conceptId = create_concept_and_answers(formElementName, conceptUUID, answer_concepts);
  formElementId = create_form_element(formElementName, formElementUUID, displayOrder, isMandatory, formElementGroupId, conceptId, keyValues);

  raise notice 'Created form_element, concept and its answers with formElement id as: %, name: %', formElementId, formElementName;

  RETURN formElementId;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION create_form_element_for_concept(formElementName VARCHAR(70), formElementUUID VARCHAR(70), displayOrder SMALLINT, isMandatory BOOLEAN, formElementGroupId BIGINT, keyValues JSON, conceptUUID VARCHAR(70), dataType VARCHAR(70))
  RETURNS BIGINT AS $$
DECLARE conceptId BIGINT;
  DECLARE formElementId BIGINT;
BEGIN
  conceptId = create_concept(formElementName, dataType, conceptUUID);
  formElementId = create_form_element(formElementName, formElementUUID, displayOrder, isMandatory, formElementGroupId, conceptId, keyValues);

  raise notice 'Created form_element and concept with formElement id as: %, name: %', formElementId, formElementName;

  RETURN formElementId;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION add_answer_to_concept(parentConceptName VARCHAR(70), childConceptName VARCHAR(70), displayOrder NUMERIC, conceptAnswerUUID VARCHAR(70))
  RETURNS BIGINT AS $$
  DECLARE conceptAnswerId BIGINT;
BEGIN
  INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES ((SELECT id from concept where name = parentConceptName), (SELECT id from concept where name = childConceptName), displayOrder, conceptAnswerUUID, 1, 1, 1, current_timestamp, current_timestamp) RETURNING id INTO conceptAnswerId;

  raise notice 'Added answer % to concept % with id:%', childConceptName, parentConceptName, conceptAnswerId;
    RETURN conceptAnswerId;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_form_element_with_gender_answers(formElementName VARCHAR(70), formElementUUID VARCHAR(70), displayOrder NUMERIC, isMandatory BOOLEAN, formElementGroupId BIGINT, conceptUUID VARCHAR(70), keyValues JSON, conceptAnswerUUIDs JSON)
  RETURNS BIGINT AS $$
  DECLARE conceptId BIGINT;
  DECLARE formElementId BIGINT;
BEGIN

  formElementId = create_form_element_for_concept(formElementName, formElementUUID, displayOrder, isMandatory, formElementGroupId, keyValues, conceptUUID, 'Coded');
  SELECT id FROM concept WHERE uuid = conceptUUID INTO conceptId;
  INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
    VALUES (conceptId, (SELECT id FROM concept WHERE name = 'Male'), 1::SMALLINT, conceptAnswerUUIDs->>0, 1, 1, 1, current_timestamp, current_timestamp);
  INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
    VALUES (conceptId, (SELECT id FROM concept WHERE name = 'Female'), 2::SMALLINT, conceptAnswerUUIDs->>1, 1, 1, 1, current_timestamp, current_timestamp);
  INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
    VALUES (conceptId, (SELECT id FROM concept WHERE name = 'Other Gender'), 3::SMALLINT, conceptAnswerUUIDs->>2, 1, 1, 1, current_timestamp, current_timestamp);
  raise notice 'Created gender form_element as: %, name: %', formElementId, formElementName;

  RETURN formElementId;
END;
$$ LANGUAGE plpgsql;
