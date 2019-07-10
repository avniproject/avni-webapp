-- Rerun this migration deliberately though there are no changes here. NEEDEDBY: V1_108
--
-- Repeatable migrations are run only when the checksum of the current file is changed.
--

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

DROP VIEW if exists address_level_type_view;

CREATE VIEW address_level_type_view AS
  WITH RECURSIVE list_of_orgs(id,
      parent_organisation_id) AS (SELECT id, parent_organisation_id
                                  FROM organisation
                                  WHERE db_user = current_user
                                  UNION ALL SELECT o.id, o.parent_organisation_id
                                            FROM organisation o,
                                                 list_of_orgs log
                                            WHERE o.id = log.parent_organisation_id)
  SELECT al.id,
    al.title,
    al.uuid,
    al.level,
    al.version,
    al.organisation_id,
    al.audit_id,
    al.is_voided,
    al.type_id,
    alt.name AS type
  from address_level al
         inner join address_level_type alt on al.type_id = alt.id
         inner join list_of_orgs loo on loo.id=al.organisation_id
  where alt.is_voided is not true;

CREATE OR REPLACE VIEW ancestor_locations_view AS
  select al.id lowestpoint_id, lineage.level, lineage.point_id :: bigint
  from address_level al
         join regexp_split_to_table(al.lineage :: text, '[.]') with ordinality lineage (point_id, level) ON al.id <> lineage.point_id :: bigint
  order by lineage.level;
