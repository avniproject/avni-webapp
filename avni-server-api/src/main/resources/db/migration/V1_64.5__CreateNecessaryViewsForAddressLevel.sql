CREATE TABLE address_level_type (
  id              SERIAL PRIMARY KEY,
  uuid            CHARACTER VARYING(255) NOT NULL DEFAULT uuid_generate_v4(),
  name            CHARACTER VARYING(255) NOT NULL,
  is_voided       BOOLEAN                NOT NULL DEFAULT FALSE,
  organisation_id INTEGER                NOT NULL,
  version         INTEGER                NOT NULL,
  audit_id        INTEGER
);

ALTER TABLE address_level
  ADD COLUMN type_id INTEGER REFERENCES address_level_type (id);

CREATE OR REPLACE VIEW address_level_type_view AS
  SELECT al.id,
         al.title,
         al.uuid,
         al.level,
         al.version,
         al.organisation_id,
         al.audit_id,
         al.is_voided
  from address_level al;

DROP FUNCTION IF EXISTS frequency_and_percentage(TEXT);
DROP FUNCTION IF EXISTS frequency_and_percentage(TEXT, TEXT);

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
                          WHERE name != ''Other''
                          UNION ALL
                          SELECT
                            ''All'' atname,
                            name gname
                          FROM gender
                          WHERE name != ''Other''
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
                          WHERE name != ''Other''
                          UNION ALL
                          SELECT
                            ''All'' atname,
                            name gname
                          FROM gender
                          WHERE name != ''Other''
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