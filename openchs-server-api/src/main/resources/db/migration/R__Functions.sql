CREATE OR REPLACE FUNCTION concept_uuid(TEXT)
  RETURNS TEXT
AS 'SELECT uuid
    FROM concept
    WHERE name = $1;'
LANGUAGE SQL
IMMUTABLE
RETURNS NULL ON NULL INPUT;


------------------------------------------------------------ GET OBSERVATION DATA ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION text_obs(ANYELEMENT, TEXT)
  RETURNS TEXT
AS 'SELECT $1.observations ->> concept_uuid($2);'
LANGUAGE SQL
IMMUTABLE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION numeric_obs(ANYELEMENT, TEXT)
  RETURNS NUMERIC AS $$
DECLARE obs NUMERIC;
BEGIN
  SELECT $1.observations ->> concept_uuid($2)
  INTO obs;
  RETURN obs;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION date_obs(ANYELEMENT, TEXT)
  RETURNS TIMESTAMP AS $$
DECLARE obs TIMESTAMP;
BEGIN
  SELECT $1.observations ->> concept_uuid($2)
  INTO obs;
  RETURN obs;
END;
$$ LANGUAGE plpgsql;

-- Returns comma separated concept names chosen as answer for the observation
CREATE OR REPLACE FUNCTION coded_obs(ANYELEMENT, TEXT)
  RETURNS TEXT AS $$
DECLARE uuids TEXT[];
  DECLARE concept_names TEXT;
  DECLARE x TEXT;
BEGIN
  SELECT translate($1.observations ->> concept_uuid($2), '[]', '{}') INTO uuids;
  IF uuids IS NOT NULL THEN
    FOREACH x IN ARRAY uuids
    LOOP
      SELECT name FROM concept WHERE uuid = x INTO x;
      concept_names := format('%s, %s', concept_names, x);
    END LOOP;
    -- remove the first space and comma
    RETURN substring(concept_names from 3);
  END IF;
  RETURN '';
END;
$$ LANGUAGE plpgsql;


------------------------------------------------------------- QUERY OBSERVATIONS ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION coded_obs_exists(ANYELEMENT, TEXT)
  RETURNS BOOLEAN AS $$
DECLARE uuids TEXT[];
BEGIN
  SELECT translate($1.observations ->> concept_uuid($2), '[]', '{}') INTO uuids;
  RETURN uuids IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Returns whether any of the observation (for concept in second argument), in the entity (first argument) contains the passed answer (third arg)
CREATE OR REPLACE FUNCTION coded_obs_contains(ANYELEMENT, TEXT, TEXT)
  RETURNS BOOLEAN AS $$
DECLARE
  uuids         TEXT[];
  x             TEXT;
  exists BOOLEAN := FALSE;
BEGIN
  SELECT translate($1.observations ->> concept_uuid($2), '[]', '{}') INTO uuids;
  IF uuids IS NOT NULL THEN
    FOREACH x IN ARRAY uuids
    LOOP
      SELECT name = $3 FROM concept WHERE uuid = x INTO exists;
      IF (exists)
      THEN
        RETURN TRUE;
      END IF;
    END LOOP;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION one_of_coded_obs_contains(ANYELEMENT, TEXT[], TEXT)
  RETURNS BOOLEAN AS $$
DECLARE
  exists BOOLEAN := FALSE;
  i      INTEGER := 1;
BEGIN
  LOOP
    EXIT WHEN i = $2.count;
    SELECT coded_obs_contains($1, $2[i], $3) INTO exists;
    IF (exists)
    THEN
      RETURN TRUE;
    END IF;
    i := i + 1;
  END LOOP;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;


-- Returns whether any the observation (for concept in second argument), in the entities (first argument) contains the passed answer (third arg)
CREATE OR REPLACE FUNCTION in_one_entity_coded_obs_contains(program_enrolment, program_encounter, TEXT, TEXT)
  RETURNS BOOLEAN AS $$
  DECLARE
    exists BOOLEAN := FALSE;
    i      INTEGER := 1;
BEGIN
    LOOP
      EXIT WHEN i = $1.count;
      SELECT coded_obs_contains($1, $3, $4) OR coded_obs_contains($2, $3, $4)  INTO exists;
      IF (exists)
      THEN
        RETURN TRUE;
      END IF;
      i := i + 1;
    END LOOP;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION one_of_coded_obs_exists(ANYELEMENT, TEXT[])
  RETURNS BOOLEAN AS $$
DECLARE
  exists BOOLEAN := FALSE;
  i      INTEGER := 1;
BEGIN
  LOOP
    EXIT WHEN i = $2.count;
    SELECT coded_obs_exists($1, $2[i]) INTO exists;
    IF (exists)
    THEN
      RETURN TRUE;
    END IF;
    i := i + 1;
  END LOOP;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;


-------------------------------- VISIT RELATED --------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_overdue_visit(program_encounter)
  RETURNS NUMERIC AS $$
BEGIN
  IF $1.earliest_visit_date_time IS NULL THEN
    RETURN 0;
  ELSEIF $1.earliest_visit_date_time > current_timestamp AND $1.encounter_date_time IS NULL THEN
    RETURN 1;
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql;