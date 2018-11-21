CREATE OR REPLACE FUNCTION concept_uuid(TEXT)
  RETURNS TEXT
AS 'SELECT uuid
    FROM concept
    WHERE name = $1;'
LANGUAGE SQL
IMMUTABLE
RETURNS NULL ON NULL INPUT;


CREATE OR REPLACE FUNCTION coded_obs_answer_uuids(JSONB, TEXT)
  RETURNS TEXT [] AS $$
DECLARE
  answerConceptUUIDs TEXT;
BEGIN
  SELECT translate($1 ->> concept_uuid($2), '[]', '{}')
  INTO answerConceptUUIDs;
  IF answerConceptUUIDs IS NULL
  THEN
    RETURN '{}';
  ELSIF POSITION('{' IN answerConceptUUIDs) = 0
    THEN
      RETURN '{' || answerConceptUUIDs || '}';
  END IF;
  RETURN answerConceptUUIDs;
END;
$$
LANGUAGE plpgsql;

------------------------------------------------------------ GET OBSERVATION DATA ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION text_obs(JSONB, TEXT)
  RETURNS TEXT
AS 'SELECT $1 ->> concept_uuid($2);'
LANGUAGE SQL
IMMUTABLE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION text_obs(ANYELEMENT, TEXT)
  RETURNS TEXT
AS 'SELECT text_obs($1.observations :: JSON, $2);'
LANGUAGE SQL
IMMUTABLE
RETURNS NULL ON NULL INPUT;


CREATE OR REPLACE FUNCTION numeric_obs(JSONB, TEXT)
  RETURNS NUMERIC AS $$
DECLARE obs NUMERIC;
BEGIN
  SELECT $1 ->> concept_uuid($2)
  INTO obs;
  RETURN obs;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION numeric_obs(ANYELEMENT, TEXT)
  RETURNS NUMERIC AS $$
DECLARE obs NUMERIC;
BEGIN
  SELECT $1.observations ->> concept_uuid($2)
  INTO obs;
  RETURN obs;
END;
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION date_obs(JSONB, TEXT)
  RETURNS TIMESTAMP AS $$
DECLARE obs TIMESTAMP;
BEGIN
  SELECT $1 ->> concept_uuid($2)
  INTO obs;
  RETURN obs;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION date_obs(ANYELEMENT, TEXT)
  RETURNS TIMESTAMP AS $$
DECLARE obs TIMESTAMP;
BEGIN
  SELECT $1.observations ->> concept_uuid($2)
  INTO obs;
  RETURN obs;
END;
$$
LANGUAGE plpgsql;


-- Returns comma separated concept names chosen as answer for the observation
CREATE OR REPLACE FUNCTION coded_obs(JSONB, TEXT)
  RETURNS TEXT AS $$
DECLARE   uuids         TEXT [];
  DECLARE concept_names TEXT;
  DECLARE x             TEXT;
BEGIN
  SELECT translate($1 ->> concept_uuid($2), '[]', '{}')
  INTO uuids;
  IF uuids IS NOT NULL
  THEN
    FOREACH x IN ARRAY uuids
    LOOP
      SELECT name
      FROM concept
      WHERE uuid = x
      INTO x;
      concept_names := format('%s, %s', concept_names, x);
    END LOOP;
    -- remove the first space and comma
    RETURN substring(concept_names FROM 3);
  END IF;
  RETURN '';
END;
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION coded_obs(ANYELEMENT, TEXT)
  RETURNS TEXT AS $$
DECLARE observations TEXT;
BEGIN
  SELECT coded_obs($1.observations :: JSON)
  INTO observations;
  RETURN observations;
END;
$$
LANGUAGE plpgsql;

------------------------------------------------------------- QUERY OBSERVATIONS ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION coded_obs_exists(JSONB, TEXT)
  RETURNS BOOLEAN AS $$
DECLARE uuids TEXT [];
BEGIN
  SELECT translate($1 ->> concept_uuid($2), '[]', '{}')
  INTO uuids;
  RETURN uuids IS NOT NULL;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION coded_obs_exists(ANYELEMENT, TEXT)
  RETURNS BOOLEAN AS $$
DECLARE returnValue BOOLEAN;
BEGIN
  SELECT coded_obs_exists($1.observations, $2)
  INTO returnValue;
  RETURN returnValue;
END;
$$
LANGUAGE plpgsql;


-- Returns whether any of the observation (for concept in second argument), in the entity (first argument) contains the passed answer (third arg)
CREATE OR REPLACE FUNCTION coded_obs_contains(JSONB, TEXT, TEXT [])
  RETURNS BOOLEAN AS $$
DECLARE
  answerConceptUUID TEXT;
  exists            BOOLEAN := FALSE;
  answerConceptName TEXT;
BEGIN
  FOREACH answerConceptUUID IN ARRAY coded_obs_answer_uuids($1, $2)
  LOOP
    FOREACH answerConceptName IN ARRAY $3
    LOOP
      SELECT name = answerConceptName
      FROM concept
      WHERE uuid = answerConceptUUID
      INTO exists;
      IF exists
      THEN
        RETURN TRUE;
      END IF;
    END LOOP;
  END LOOP;
  RETURN FALSE;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION coded_obs_contains(ANYELEMENT, TEXT, TEXT [])
  RETURNS BOOLEAN AS $$
DECLARE
  returnValue BOOLEAN;
BEGIN
  SELECT coded_obs_contains($1.observations :: JSON, $2, $3)
  INTO returnValue;
  RETURN returnValue;
END;
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION coded_obs_contains_any_except(JSONB, TEXT, TEXT [])
  RETURNS BOOLEAN AS $$
DECLARE
  answerConceptUUIDs TEXT [];
  answerConceptUUID  TEXT;
  exists             BOOLEAN := FALSE;
  answerConceptName  TEXT;
BEGIN
  SELECT coded_obs_answer_uuids($1, $2)
  INTO answerConceptUUIDs;
  IF array_length(answerConceptUUIDs, 1) > 0
  THEN
    FOREACH answerConceptUUID IN ARRAY answerConceptUUIDs
    LOOP
      FOREACH answerConceptName IN ARRAY $3
      LOOP
        SELECT name = answerConceptName
        FROM concept
        WHERE uuid = answerConceptUUID
        INTO exists;
        IF exists
        THEN
          RETURN FALSE;
        END IF;
      END LOOP;
    END LOOP;
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION one_of_coded_obs_contains(JSONB, TEXT [], TEXT [])
  RETURNS BOOLEAN AS $$
DECLARE
  exists BOOLEAN := FALSE;
  i      INTEGER := 1;
BEGIN
  LOOP
    EXIT WHEN i > array_length($2, 1);
    SELECT coded_obs_contains($1, $2 [i], $3)
    INTO exists;
    IF exists
    THEN
      RETURN TRUE;
    END IF;
    i := i + 1;
  END LOOP;
  RETURN FALSE;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION one_of_coded_obs_contains(ANYELEMENT, TEXT [], TEXT [])
  RETURNS BOOLEAN AS $$
DECLARE
  returnValue BOOLEAN;
BEGIN
  SELECT one_of_coded_obs_contains($1.observations :: JSON, $2, $3)
  INTO returnValue;
  RETURN returnValue;
END;
$$
LANGUAGE plpgsql;


-- Returns whether any the observation (for concept in second argument), in the entities (first argument) contains the passed answer (third arg)
CREATE OR REPLACE FUNCTION in_one_entity_coded_obs_contains(JSONB, JSONB, TEXT, TEXT [])
  RETURNS BOOLEAN AS $$
DECLARE
  exists BOOLEAN := FALSE;
BEGIN
  SELECT coded_obs_contains($1, $3, $4) OR coded_obs_contains($2, $3, $4)
  INTO exists;
  RETURN exists;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION in_one_entity_coded_obs_contains(PROGRAM_ENROLMENT, PROGRAM_ENCOUNTER, TEXT, TEXT [])
  RETURNS BOOLEAN AS $$
DECLARE
  returnValue BOOLEAN;
BEGIN
  SELECT in_one_entity_coded_obs_contains($1.observations :: JSON, $2.observations :: JSON, $3, $4)
  INTO returnValue;
  RETURN returnValue;
END;
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION one_of_coded_obs_exists(JSONB, TEXT [])
  RETURNS BOOLEAN AS $$
DECLARE
  exists BOOLEAN := FALSE;
  i      INTEGER := 1;
BEGIN
  LOOP
    EXIT WHEN i > array_length($2, 1);
    SELECT coded_obs_exists($1, $2 [i])
    INTO exists;
    IF exists
    THEN
      RETURN TRUE;
    END IF;
    i := i + 1;
  END LOOP;
  RETURN FALSE;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION one_of_coded_obs_exists(ANYELEMENT, TEXT [])
  RETURNS BOOLEAN AS $$
DECLARE
  returnValue BOOLEAN;
BEGIN
  SELECT one_of_coded_obs_exists($1.observations :: JSON, $2)
  INTO returnValue;
  RETURN returnValue;
END;
$$
LANGUAGE plpgsql;

-------------------------------- VISIT RELATED --------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_overdue_visit(PROGRAM_ENCOUNTER)
  RETURNS NUMERIC AS $$
BEGIN
  IF $1.earliest_visit_date_time IS NULL
  THEN
    RETURN 0;
  ELSEIF $1.earliest_visit_date_time > current_timestamp AND $1.encounter_date_time IS NULL
    THEN
      RETURN 1;
  ELSE
    RETURN 0;
  END IF;
END;
$$
LANGUAGE plpgsql;

------------------------------------- JSONB FUNCTIONS ------------------------------------------------------------------
DROP FUNCTION IF EXISTS jsonb_merge( JSONB );

CREATE OR REPLACE FUNCTION jsonb_merge(arr JSONB)
  RETURNS JSONB AS $$
DECLARE merged_jsonb JSONB;
BEGIN
  merged_jsonb := '{}' :: JSONB;
  FOR i IN 0..(jsonb_array_length(arr)-1)
  LOOP
    merged_jsonb := (merged_jsonb || ((arr ->> i) :: JSONB));
  END LOOP;
  RETURN merged_jsonb;
END
$$
LANGUAGE plpgsql;


--------------------------------- REPORTING FUNCTIONS ----------------------------------------------------------------
DROP FUNCTION IF EXISTS frequency_and_percentage( TEXT );
DROP FUNCTION IF EXISTS frequency_and_percentage( TEXT, TEXT );

CREATE OR REPLACE FUNCTION frequency_and_percentage(frequency_query TEXT)
  RETURNS TABLE(total BIGINT, percentage FLOAT, gender VARCHAR, address_type VARCHAR) AS $$
DECLARE separator TEXT;
BEGIN
  SELECT md5(random() :: TEXT) :: TEXT
  INTO separator;
  EXECUTE format('CREATE TEMPORARY TABLE query_output_%s (
    uuid         VARCHAR,
    gender_name  VARCHAR,
    address_type VARCHAR,
    address_name VARCHAR
  ) ON COMMIT DROP', separator);

  EXECUTE format('CREATE TEMPORARY TABLE aggregates_%s (
    total        BIGINT,
    percentage   FLOAT,
    gender       VARCHAR,
    address_type VARCHAR
  ) ON COMMIT DROP', separator);

  -- Store filtered query into a temporary variable


  EXECUTE FORMAT('INSERT INTO query_output_%s (uuid, gender_name, address_type, address_name) %s', separator,
                 frequency_query);

  EXECUTE format('INSERT INTO aggregates_%s (total, gender, address_type)
    SELECT
      count(qo.uuid)  total,
      qo.gender_name  gender,
      qo.address_type address_type
    FROM query_output_%s qo
    GROUP BY qo.gender_name, qo.address_type', separator, separator);


  EXECUTE format('INSERT INTO aggregates_%s (total, gender, address_type)
    SELECT
      count(qo.uuid)  total,
      ''Total''         gender,
      qo.address_type address_type
    FROM query_output_%s qo
    GROUP BY qo.address_type', separator, separator);

  EXECUTE format('INSERT INTO aggregates_%s (total, gender, address_type)
    SELECT
      count(qo.uuid)  total,
      qo.gender_name  gender,
      ''All'' address_type
    FROM query_output_%s qo
    GROUP BY qo.gender_name', separator, separator);

  EXECUTE format('INSERT INTO aggregates_%s (total, gender, address_type)
    SELECT
      count(qo.uuid) total,
      ''Total''        gender,
      ''All''          address_type
    FROM query_output_%s qo', separator, separator);

  EXECUTE format('UPDATE aggregates_%s ag1
  SET percentage = coalesce(round(((ag1.total / (SELECT sum(ag2.total)
                                                 FROM aggregates_%s ag2
                                                 WHERE (ag2.address_type = ag1.address_type AND ag2.gender != ''Total'')))
                                   * 100), 2), 100)', separator, separator);

  EXECUTE FORMAT('INSERT INTO aggregates_%s (total, percentage, address_type, gender)
                        SELECT 0, 0, atname, gname from (
                            SELECT DISTINCT type atname,
                            name gname
                          FROM address_level_type_view, gender
                          UNION ALL
                          SELECT
                            ''All'' atname,
                            name gname
                          FROM gender
                          UNION ALL
                          SELECT DISTINCT
                            type atname,
                            ''Total'' gname
                          FROM address_level_type_view
                          UNION ALL
                          SELECT
                            ''All'' atname,
                            ''Total'' gname) as agt where (atname, gname) not in (select address_type, gender from aggregates_%s)',
                 separator, separator);

  RETURN QUERY EXECUTE format('SELECT *
               FROM aggregates_%s order by address_type, gender', separator);
END
$$
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION frequency_and_percentage(frequency_query TEXT, denominator_query TEXT)
  RETURNS TABLE(total BIGINT, percentage FLOAT, gender VARCHAR, address_type VARCHAR) AS $$
DECLARE separator TEXT;
BEGIN
  SELECT md5(random() :: TEXT) :: TEXT
  INTO separator;
  EXECUTE FORMAT('CREATE TEMPORARY TABLE query_output_%s (
    uuid         VARCHAR,
    gender_name  VARCHAR,
    address_type VARCHAR,
    address_name VARCHAR
  ) ON COMMIT DROP', separator);

  EXECUTE FORMAT('CREATE TEMPORARY TABLE denominator_query_output_%s (
    uuid         VARCHAR,
    gender_name  VARCHAR,
    address_type VARCHAR,
    address_name VARCHAR
  ) ON COMMIT DROP', separator);

  EXECUTE format('CREATE TEMPORARY TABLE aggregates_%s (
    total        BIGINT,
    percentage   FLOAT,
    gender       VARCHAR,
    address_type VARCHAR
  ) ON COMMIT DROP', separator);

  EXECUTE FORMAT('CREATE TEMPORARY TABLE denominator_aggregates_%s (
    total        BIGINT,
    gender       VARCHAR,
    address_type VARCHAR
  ) ON COMMIT DROP', separator);
  -- Store filtered query into a temporary variable

  EXECUTE FORMAT('INSERT INTO query_output_%s (uuid, gender_name, address_type, address_name) %s', separator,
                 frequency_query);

  EXECUTE FORMAT('INSERT INTO denominator_query_output_%s (uuid, gender_name, address_type, address_name) %s',
                 separator,
                 denominator_query);

  EXECUTE format('INSERT INTO aggregates_%s (total, gender, address_type)
    SELECT
      count(qo.uuid)  total,
      qo.gender_name  gender,
      qo.address_type address_type
    FROM query_output_%s qo
    GROUP BY qo.gender_name, qo.address_type', separator, separator);

  EXECUTE format('INSERT INTO denominator_aggregates_%s (total, gender, address_type)
    SELECT
      count(qo.uuid)  total,
      qo.gender_name  gender,
      qo.address_type address_type
    FROM denominator_query_output_%s qo
    GROUP BY qo.gender_name, qo.address_type', separator, separator);


  EXECUTE format('INSERT INTO aggregates_%s (total, gender, address_type)
    SELECT
      count(qo.uuid)  total,
      ''Total''         gender,
      qo.address_type address_type
    FROM query_output_%s qo
    GROUP BY qo.address_type', separator, separator);

  EXECUTE format('INSERT INTO denominator_aggregates_%s (total, gender, address_type)
    SELECT
      count(qo.uuid)  total,
      ''Total''         gender,
      qo.address_type address_type
    FROM denominator_query_output_%s qo
    GROUP BY qo.address_type', separator, separator);

  EXECUTE format('INSERT INTO aggregates_%s (total, gender, address_type)
    SELECT
      count(qo.uuid)  total,
      qo.gender_name  gender,
      ''All'' address_type
    FROM query_output_%s qo
    GROUP BY qo.gender_name', separator, separator);

  EXECUTE format('INSERT INTO denominator_aggregates_%s (total, gender, address_type)
    SELECT
      count(qo.uuid)  total,
      qo.gender_name  gender,
      ''All'' address_type
    FROM denominator_query_output_%s qo
    GROUP BY qo.gender_name', separator, separator);

  EXECUTE format('INSERT INTO aggregates_%s (total, gender, address_type)
    SELECT
      count(qo.uuid) total,
      ''Total''        gender,
      ''All''          address_type
    FROM query_output_%s qo', separator, separator);

  EXECUTE format('INSERT INTO denominator_aggregates_%s (total, gender, address_type)
    SELECT
      count(qo.uuid) total,
      ''Total''        gender,
      ''All''          address_type
    FROM denominator_query_output_%s qo', separator, separator);

  EXECUTE FORMAT('UPDATE aggregates_%s ag1
  SET percentage = (SELECT coalesce(round(((ag2.total :: FLOAT / dag1.total) * 100) :: NUMERIC, 2), 100)
                    FROM aggregates_%s ag2
                      INNER JOIN denominator_aggregates_%s dag1
                        ON ag2.address_type = dag1.address_type AND ag2.gender = dag1.gender
                    WHERE ag2.address_type = ag1.address_type AND ag2.gender = ag1.gender
                    LIMIT 1)', separator, separator, separator);

  EXECUTE FORMAT('INSERT INTO aggregates_%s (total, percentage, address_type, gender)
                        SELECT 0, 0, atname, gname from (
                            SELECT DISTINCT type atname,
                            name gname
                          FROM address_level_type_view, gender
                          UNION ALL
                          SELECT
                            ''All'' atname,
                            name gname
                          FROM gender
                          UNION ALL
                          SELECT DISTINCT
                            type atname,
                            ''Total'' gname
                          FROM address_level_type_view
                          UNION ALL
                          SELECT
                            ''All'' atname,
                            ''Total'' gname) as agt where (atname, gname) not in (select address_type, gender from aggregates_%s)',
                 separator, separator);

  RETURN QUERY EXECUTE format('SELECT *
               FROM aggregates_%s order by address_type, gender', separator);
END
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION multi_select_coded(obs JSONB)
  RETURNS VARCHAR LANGUAGE plpgsql
AS $$
DECLARE result VARCHAR;
BEGIN
  BEGIN
    IF JSONB_TYPEOF(obs) = 'array'
    THEN
      SELECT STRING_AGG(C.NAME, ' ,')
      FROM JSONB_ARRAY_ELEMENTS_TEXT(obs) AS OB (UUID)
             JOIN CONCEPT C ON C.UUID = OB.UUID
      INTO RESULT;
    ELSEIF obs NOTNULL then
      raise notice '% is not MultiSelect', obs;
      SELECT SINGLE_SELECT_CODED(obs::TEXT) INTO RESULT;
    ELSE
      select null into result;
    END IF;
    RETURN RESULT;
  EXCEPTION WHEN OTHERS
    THEN
      RAISE NOTICE 'Failed while processing multi_select_coded(''%'')', obs :: TEXT;
      RAISE NOTICE '% %', SQLERRM, SQLSTATE;
  END;
END $$;

CREATE OR REPLACE FUNCTION single_select_coded(obs TEXT)
  RETURNS VARCHAR LANGUAGE plpgsql
AS $$
DECLARE result VARCHAR;
BEGIN
  BEGIN
    SELECT name
    FROM concept
    WHERE uuid = obs
    INTO result;
    RETURN result;
  END;
END $$ STABLE;


CREATE OR REPLACE FUNCTION create_audit()
  RETURNS INTEGER AS $$
DECLARE result INTEGER;
BEGIN
  INSERT INTO audit(created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES(1,1, now(), now()) RETURNING id into result;
  RETURN result;
END $$
LANGUAGE plpgsql;

drop function if exists checklist_itemstatus_starting(status jsonb);
CREATE OR REPLACE FUNCTION checklist_itemstatus_starting(status jsonb)
  RETURNS INTERVAL AS $$
DECLARE
  returnValue INTERVAL;
BEGIN
  select (CASE
      WHEN status#>>'{from,day}' NOTNULL
             THEN status#>>'{from,day}' || ' day'
      WHEN status#>>'{from,week}' NOTNULL
             THEN status#>>'{from,week}' || ' week'
      WHEN status#>>'{from,month}' NOTNULL
             THEN status#>>'{from,month}' || ' month'
      WHEN status#>>'{from,year}' NOTNULL
             THEN status#>>'{from,year}' || ' year' END) :: INTERVAL
  into returnValue;
  RETURN returnValue;
END;
$$
LANGUAGE plpgsql IMMUTABLE;

drop function if exists checklist_itemstatus_ending(status jsonb);
CREATE OR REPLACE FUNCTION checklist_itemstatus_ending(status jsonb)
  RETURNS INTERVAL AS $$
DECLARE
  returnValue INTERVAL ;
BEGIN
  select (CASE
      WHEN status#>>'{to,day}' NOTNULL
             THEN status#>>'{to,day}' || ' day'
      WHEN status#>>'{to,week}' NOTNULL
             THEN status#>>'{to,week}' || ' week'
      WHEN status#>>'{to,month}' NOTNULL
             THEN status#>>'{to,month}' || ' month'
      WHEN status#>>'{to,year}' NOTNULL
             THEN status#>>'{to,year}' || ' year' END) :: INTERVAL
  into returnValue;
  RETURN returnValue;
END;
$$
LANGUAGE plpgsql IMMUTABLE;
