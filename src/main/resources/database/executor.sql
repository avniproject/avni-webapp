select deleteMetaDataCascade('encounter_form');

drop FUNCTION insert_form_element_for_concept_with_answers(formElementName VARCHAR(70), formElementUUID VARCHAR(70), displayOrder NUMERIC, isMandatory BOOLEAN, formElementGroupId BIGINT, conceptName VARCHAR(70), conceptUUID VARCHAR(70), answer_concepts JSON);

INSERT INTO concept_answer (concept_id, answer_concept_id, answer_order, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
VALUES (1, 2, '{"a":1,"b":2}'::json->>'b', 'f6e8ada2-0a35-48ab-bda1-2a58bdf1fa54', 1, 1, 1, current_timestamp, current_timestamp);

select ('{"a":1,"b":2}'::json->>'b')::SMALLINT;


CREATE OR REPLACE FUNCTION test()
  RETURNS VOID AS $$
BEGIN
  raise notice 'Starting....';

  INSERT INTO gender (name, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES ('foo', '6c734a0e-e051-467e-82ec-8f31baa1a14a', 1, 1, 1, current_timestamp, current_timestamp);
  INSERT INTO gender (name, uuid, version, created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES ('foo2', '6c734a0e-e051-467e-82ec-8f31baa1a14a', 1, 1, 1, current_timestamp, current_timestamp);


  EXCEPTION WHEN others THEN
  raise notice '% %', SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql;

SELECT test();
SELECT test();

-- USEFUL QUERIES
select f.name, f.form_type, fm.form_id, fm.entity_id, fm.observations_type_entity_id from form_mapping fm, form f where fm.form_id = f.id order by fm.entity_id, fm.observations_type_entity_id;