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
    alt.level,
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

CREATE OR REPLACE VIEW title_lineage_locations_view AS
  select al.id lowestpoint_id, string_agg(alevel_in_lineage.title, ', ' order by lineage.level) title_lineage
  from address_level al
         join regexp_split_to_table(al.lineage :: text, '[.]') with ordinality lineage (point_id, level) ON TRUE
         join address_level alevel_in_lineage on alevel_in_lineage.id = lineage.point_id :: int
  group by al.id;

  CREATE OR REPLACE VIEW individual_program_enrolment_search_view AS
   SELECT progralalise.individual_id,
      string_agg(progralalise.programname, ','::text) AS program_name
     FROM ( SELECT pe.individual_id,
              concat(prog.name, ':', prog.colour) AS programname
             FROM program_enrolment pe
               JOIN program prog ON prog.id = pe.program_id
            GROUP BY pe.individual_id, prog.name, prog.colour) progralalise
    GROUP BY progralalise.individual_id;

