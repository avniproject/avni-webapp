CREATE OR REPLACE FUNCTION concept_uuid(TEXT)
  RETURNS TEXT
AS 'SELECT uuid
    FROM concept
    WHERE name = $1;'
LANGUAGE SQL
IMMUTABLE
RETURNS NULL ON NULL INPUT;

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

CREATE OR REPLACE FUNCTION coded_obs_exists(ANYELEMENT, TEXT)
  RETURNS TEXT AS $$
DECLARE uuids TEXT[];
BEGIN
  SELECT translate($1.observations ->> concept_uuid($2), '[]', '{}') INTO uuids;
  RETURN uuids IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_overdue_visit(program_encounter)
  RETURNS NUMERIC AS $$
BEGIN
  IF $1.scheduled_date_time IS NULL THEN
    RETURN 0;
  ELSEIF $1.scheduled_date_time > current_timestamp AND $1.encounter_date_time IS NULL THEN
    RETURN 1;
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql;