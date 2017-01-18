CREATE OR REPLACE FUNCTION deleteMetaDataCascade(formName VARCHAR(70))
  RETURNS VOID AS $$
    DECLARE formId BIGINT;
BEGIN
      SET CONSTRAINTS ALL DEFERRED;

      select id into formId from form WHERE name = formName;
      DELETE FROM form_mapping where form_id = formId;
      DELETE FROM concept_answer WHERE concept_id IN (SELECT concept_id FROM form_element where form_element_group_id in (SELECT id from form_element_group where form_id = formId));
      DELETE FROM form_element where form_element_group_id in (SELECT id from form_element_group where form_id = formId);
      DELETE FROM concept WHERE id IN (SELECT concept_id FROM form_element where form_element_group_id in (SELECT id from form_element_group where form_id = formId));
      DELETE FROM form_element_group where form_id = formId;
      DELETE FROM form where id = formId;

      SET CONSTRAINTS ALL IMMEDIATE;

      EXCEPTION WHEN others THEN
        raise notice '% %', SQLERRM, SQLSTATE;
        SET CONSTRAINTS ALL IMMEDIATE;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION insert_concept(name VARCHAR(70), data_type VARCHAR(20), uuid VARCHAR(70))
  RETURNS BIGINT AS $$
DECLARE conceptid BIGINT;
BEGIN
  INSERT INTO concept (id, name, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES (DEFAULT, name, data_type, uuid, 1, 1, 1, current_timestamp, current_timestamp)  RETURNING id into conceptid;

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
    INSERT INTO concept (name, data_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
    VALUES (answer.name, 'N/A', answer.uuid, 1, 1, 1, current_timestamp, current_timestamp) RETURNING id into answerConceptId;

    INSERT INTO concept_answer (concept_id, answer_concept_id, sort_weight, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
    VALUES (conceptId, answerConceptId, answer.sortWeight, answer.uuid, 1, 1, 1, current_timestamp, current_timestamp);
  END LOOP;

  RETURN conceptId;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION create_form(form VARCHAR(70), formUUID VARCHAR(70), formType VARCHAR(70), formMapping JSON)
  RETURNS BIGINT AS $$
DECLARE formId BIGINT;
BEGIN
  INSERT INTO form (name, form_type, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES (form, formType, formUUID, 1, 1, 1, current_timestamp, current_timestamp) RETURNING id INTO formId;

  INSERT INTO form_mapping (form_id, related_entity, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES (formId, formMapping, 'ace4c845-7f4a-4b6c-ba41-4a37d774b3e2', 1, 1, 1, current_timestamp, current_timestamp);

  RETURN formId;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION create_form_group(name VARCHAR(70), uuid VARCHAR(70), displayOrder SMALLINT, formID BIGINT)
  RETURNS BIGINT AS $$
DECLARE formElementGroupId BIGINT;
BEGIN
  INSERT INTO form_element_group (id, name, form_id, display_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES (DEFAULT, name, formID, displayOrder, uuid, 1, 1, 1, current_timestamp, current_timestamp) RETURNING id INTO formElementGroupId;

  RETURN formElementGroupId;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION insert_form_element_for_concept_with_answers(formElementName VARCHAR(70), formElementUUID VARCHAR(70), displayOrder NUMERIC, isMandatory BOOLEAN, formElementGroupId BIGINT, conceptName VARCHAR(70), conceptUUID VARCHAR(70), answer_concepts JSON)
  RETURNS BIGINT AS $$
DECLARE conceptId BIGINT;
  DECLARE formElementId BIGINT;
BEGIN
  conceptId = insert_concept_and_answers(conceptName, conceptUUID, answer_concepts);

  INSERT INTO form_element (id, name, display_order, is_mandatory, concept_id, is_used_in_summary, is_generated, form_element_group_id, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES (DEFAULT, formElementName, displayOrder, isMandatory, conceptId, FALSE, FALSE, formElementGroupId, formElementUUID, 1, 1, 1, current_timestamp, current_timestamp) RETURNING id INTO formElementId;

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

  RETURN formElementId;
END;
$$ LANGUAGE plpgsql;