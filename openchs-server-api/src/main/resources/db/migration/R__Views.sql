-- Rerun this migration deliberately though there are no changes here. NEEDEDBY: V1_108
--
-- Repeatable migrations are run only when the checksum of the current file is changed.
--

CREATE OR REPLACE FUNCTION create_audit()
  RETURNS INTEGER AS $$
DECLARE result INTEGER;
BEGIN
  INSERT INTO audit(created_by_id, last_modified_by_id, created_date_time, last_modified_date_time)
  VALUES(1,1, now(), now()) RETURNING id into result;
  RETURN result;
END $$
LANGUAGE plpgsql;

CREATE OR REPLACE VIEW virtual_catchment_address_mapping_table AS (
  WITH RECURSIVE intermediary_table AS (
      SELECT
        c.id   cid,
        al1.id aid,
        al2.id parent_id
      FROM address_level al1
        LEFT OUTER JOIN location_location_mapping llm ON al1.id = llm.location_id
        LEFT OUTER JOIN address_level al2 ON llm.parent_location_id = al2.id
        LEFT OUTER JOIN catchment_address_mapping cam ON cam.addresslevel_id = al1.id
        LEFT OUTER JOIN catchment c ON cam.catchment_id = c.id
  ), vt AS (
    SELECT
      cid,
      aid,
      parent_id
    FROM intermediary_table
    UNION ALL
    SELECT
      vt.cid,
      it.aid,
      it.parent_id
    FROM intermediary_table it, vt
    WHERE vt.aid = it.parent_id
  ) SELECT
      row_number()
      OVER () AS id,
      cid     AS catchment_id,
      aid     AS addresslevel_id
    FROM vt
    WHERE cid IS NOT NULL
    GROUP BY cid, aid
);

CREATE OR REPLACE VIEW address_level_type_view AS
  WITH RECURSIVE list_of_orgs(id,
      parent_organisation_id) AS (SELECT id, parent_organisation_id
                                  FROM organisation
                                  WHERE db_user = current_user
                                  UNION ALL SELECT o.id, o.parent_organisation_id
                                            FROM organisation o,
                                                 list_of_orgs log
                                            WHERE o.id = log.parent_organisation_id)
  SELECT al.*, alt.name as "type"
  from address_level al
         inner join address_level_type alt on al.type_id = alt.id
         inner join list_of_orgs loo on loo.id=al.organisation_id
  where alt.is_voided is not true;
