CREATE OR REPLACE FUNCTION deleteMetaDataCascade(formName VARCHAR(70))
  RETURNS VOID AS $$
    DECLARE formId BIGINT;
BEGIN
      raise notice 'Deleting all data for form: %', formName;
      select id into formId from form WHERE name = formName;

      DELETE FROM form_mapping where form_id = formId;
      raise notice 'Deleted all form_mapping for formId: %', formId;

      DELETE FROM concept_answer WHERE concept_id IN (SELECT concept_id FROM form_element where form_element_group_id in (SELECT id from form_element_group where form_id = formId));
      raise notice 'Deleted all concept_answer for formId: %', formId;

      DELETE FROM form_element where form_element_group_id in (SELECT id from form_element_group where form_id = formId);
      raise notice 'Deleted all form_element for formId: %', formId;

--       delete concepts which are not referenced to by any form element and also not present in any concept answer. not incorporated gender, followup_type and encounter_type having concepts since we are not using it yet
      DELETE FROM concept WHERE id NOT IN
                (SELECT id FROM concept c
                    where id not in (select concept_id from form_element) and id not in (select concept_id from concept_answer) and id not in (select answer_concept_id from concept_answer));
      raise notice 'Deleted all concepts not being used in any forms';

      DELETE FROM form_element_group where form_id = formId;
      raise notice 'Deleted all form_element_group for formId: %', formId;

      DELETE FROM form where id = formId;
      raise notice 'Deleted form with id: %', formId;

      EXCEPTION WHEN others THEN
        raise notice '% %', SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION insert_concept(name VARCHAR(70), data_type VARCHAR(20), uuid VARCHAR(70))
  RETURNS BIGINT AS $$
DECLARE conceptid BIGINT;
BEGIN
  INSERT INTO concept (id, name, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES (DEFAULT, name, data_type, uuid, 1, 1, 1, current_timestamp, current_timestamp)  RETURNING id into conceptid;

  raise notice 'Created concept with id: %, name: %', conceptid, name;

  RETURN conceptid;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION insert_concept_and_answers(name VARCHAR(70), uuid VARCHAR(70), answers JSON)
  RETURNS BIGINT AS $$
DECLARE answerConceptId BIGINT;
  DECLARE conceptId BIGINT;
  DECLARE answer JSON;
BEGIN
  conceptId = insert_concept(name, 'Coded', uuid);

  FOR answer IN SELECT *
                FROM json_array_elements(answers)
  LOOP
    RAISE NOTICE '%, %', answer, answer->>'answerOrder';
    INSERT INTO concept (name, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
    VALUES (answer->>'name', 'N/A', answer->>'uuid', 1, 1, 1, current_timestamp, current_timestamp) RETURNING id into answerConceptId;

    INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
    VALUES (conceptId, answerConceptId, (answer->>'answerOrder')::SMALLINT, answer->>'uuid', 1, 1, 1, current_timestamp, current_timestamp);
  END LOOP;

  raise notice 'Created concept and answers for concept id: %, name: %', conceptid, name;

  RETURN conceptId;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION create_form(form VARCHAR(70), formUUID VARCHAR(70), formType VARCHAR(70), entityId BIGINT, formMappingUUID VARCHAR(70))
  RETURNS BIGINT AS $$
DECLARE formId BIGINT;
BEGIN
  INSERT INTO form (name, form_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES (form, formType, formUUID, 1, 1, 1, current_timestamp, current_timestamp) RETURNING id INTO formId;

  INSERT INTO form_mapping (form_id, entity_id, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES (formId, entityId, formMappingUUID, 1, 1, 1, current_timestamp, current_timestamp);

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


CREATE OR REPLACE FUNCTION insert_form_element_for_concept_with_answers(formElementName VARCHAR(70), formElementUUID VARCHAR(70), displayOrder NUMERIC, isMandatory BOOLEAN, formElementGroupId BIGINT, conceptUUID VARCHAR(70), answer_concepts JSON)
  RETURNS BIGINT AS $$
DECLARE conceptId BIGINT;
  DECLARE formElementId BIGINT;
BEGIN
  conceptId = insert_concept_and_answers(formElementName, conceptUUID, answer_concepts);

  INSERT INTO form_element (id, name, display_order, is_mandatory, concept_id, is_used_in_summary, is_generated, form_element_group_id, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES (DEFAULT, formElementName, displayOrder, isMandatory, conceptId, FALSE, FALSE, formElementGroupId, formElementUUID, 1, 1, 1, current_timestamp, current_timestamp) RETURNING id INTO formElementId;

  raise notice 'Created form_element, concept and its answers with formElement id as: %, name: %', formElementId, formElementName;

  RETURN formElementId;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION insert_form_element_for_concept(formElementName VARCHAR(70), formElementUUID VARCHAR(70), displayOrder NUMERIC, isMandatory BOOLEAN, formElementGroupId BIGINT, conceptUUID VARCHAR(70), dataType VARCHAR(70))
  RETURNS BIGINT AS $$
DECLARE conceptId BIGINT;
  DECLARE formElementId BIGINT;
BEGIN
  conceptId = insert_concept(formElementName, dataType, conceptUUID);

  INSERT INTO form_element (id, name, display_order, is_mandatory, concept_id, is_used_in_summary, is_generated, form_element_group_id, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES (DEFAULT, formElementName, displayOrder, isMandatory, conceptId, FALSE, FALSE, formElementGroupId, formElementUUID, 1, 1, 1, current_timestamp, current_timestamp) RETURNING id INTO formElementId;

  raise notice 'Created form_element and concept with formElement id as: %, name: %', formElementId, formElementName;

  RETURN formElementId;
END;
$$ LANGUAGE plpgsql;