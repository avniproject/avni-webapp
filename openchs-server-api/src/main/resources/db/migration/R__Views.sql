-- Rerun this migration deliberately though there are no changes here. NEEDEDBY: V1_108
--
-- Repeatable migrations are run only when the checksum of the current file is changed.
--

CREATE OR REPLACE FUNCTION virtual_catchment_address_mapping_function()
    RETURNS TABLE
            (
                id              bigint,
                catchment_id    int,
                addresslevel_id int
            )
    LANGUAGE sql
    SECURITY INVOKER
AS
$$
select row_number() OVER ()  AS id,
       cam.catchment_id::int AS catchment_id,
       al.id                 AS addresslevel_id
from address_level al
         left outer join regexp_split_to_table((al.lineage)::text, '[.]'::text) WITH ORDINALITY lineage(point_id, level)
                         ON (true)
         left outer join catchment_address_mapping cam on cam.addresslevel_id = point_id::int
where catchment_id notnull
group by 2, 3
$$;

CREATE or replace VIEW virtual_catchment_address_mapping_table AS
SELECT *
FROM virtual_catchment_address_mapping_function();


DROP VIEW if exists address_level_type_view;

CREATE VIEW address_level_type_view AS
WITH RECURSIVE list_of_orgs(id,
                            parent_organisation_id) AS (SELECT id, parent_organisation_id
                                                        FROM organisation
                                                        WHERE db_user = current_user
                                                        UNION ALL
                                                        SELECT o.id, o.parent_organisation_id
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
         inner join list_of_orgs loo on loo.id = al.organisation_id
where alt.is_voided is not true;

CREATE OR REPLACE function title_lineage_locations_function()
    RETURNS TABLE
            (
                lowestpoint_id integer,
                title_lineage  text
            )
    LANGUAGE sql
    SECURITY INVOKER
AS
$$
select al.id lowestpoint_id, string_agg(alevel_in_lineage.title, ', ' order by lineage.level) title_lineage
from address_level al
         join regexp_split_to_table(al.lineage :: text, '[.]') with ordinality lineage (point_id, level) ON TRUE
         join address_level alevel_in_lineage on alevel_in_lineage.id = lineage.point_id :: int
group by al.id
$$;

CREATE OR REPLACE VIEW title_lineage_locations_view AS
select *
from title_lineage_locations_function();

CREATE OR REPLACE VIEW individual_program_enrolment_search_view AS
SELECT progralalise.individual_id,
       string_agg(progralalise.programname, ','::text) AS program_name
FROM (SELECT pe.individual_id,
             concat(op.name, ':', prog.colour) AS programname
      FROM program_enrolment pe
               JOIN program prog ON prog.id = pe.program_id
               JOIN operational_program op ON prog.id = op.program_id AND pe.organisation_id = op.organisation_id
      WHERE pe.program_exit_date_time isnull
      GROUP BY pe.individual_id, op.name, prog.colour) progralalise
GROUP BY progralalise.individual_id;
