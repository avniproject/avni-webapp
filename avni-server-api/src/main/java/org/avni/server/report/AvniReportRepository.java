package org.avni.server.report;

import org.avni.server.application.FormMapping;
import org.avni.server.domain.Concept;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AvniReportRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final ReportHelper reportHelper;

    @Autowired
    public AvniReportRepository(NamedParameterJdbcTemplate jdbcTemplate,
                                ReportHelper reportHelper) {
        this.jdbcTemplate = jdbcTemplate;
        this.reportHelper = reportHelper;
    }

    public List<AggregateReportResult> generateAggregatesForCodedConcept(Concept concept, FormMapping formMapping, String startDate, String endDate, List<Long> lowestLocationIds) {
        String query = "with base_result as (\n" +
                "    select unnest(case\n" +
                "                      when jsonb_typeof(${obsColumn} -> ${conceptUUID}) = 'array'\n" +
                "                          then TRANSLATE((${obsColumn} -> ${conceptUUID})::jsonb::text, '[]', '{}')::TEXT[]\n" +
                "                      else ARRAY [${obsColumn} ->> ${conceptUUID}] end) as indicator,\n" +
                "           count(*)                                                     as count\n" +
                "    from ${dynamicFrom}\n" +
                "    where ${dynamicWhere}\n" +
                "    group by 1\n" +
                ")\n" +
                "select coalesce(concept_name(indicator), coalesce(indicator, 'Not answered')) indicator,\n" +
                "       count\n" +
                "from base_result";
        String queryWithConceptUUID = query.replace("${conceptUUID}", "'" + concept.getUuid() + "'");
        return jdbcTemplate.query(reportHelper.buildQuery(formMapping, queryWithConceptUUID, startDate, endDate, lowestLocationIds), new AggregateReportMapper());
    }

    public List<AggregateReportResult> generateAggregatesForEntityByType(String entity, String operationalType, String operationalTypeIdColumn, String dynamicWhere, String dynamicJoin) {
        String baseQuery = "select o.name as indicator,\n" +
                "       count(*) as count\n" +
                "from ${entity} e\n" +
                "         join ${operational_type} o on e.${operational_type_id} = o.${operational_type_id}\n" +
                "         ${dynamic_join}\n" +
                "where e.is_voided = false\n" +
                "  and o.is_voided = false\n" +
                "  ${dynamic_where}\n" +
                "group by o.name";
        String query = baseQuery
                .replace("${entity}", entity)
                .replace("${operational_type}", operationalType)
                .replace("${operational_type_id}", operationalTypeIdColumn)
                .replace("${dynamic_where}", dynamicWhere)
                .replace("${dynamic_join}", dynamicJoin);
        return jdbcTemplate.query(query, new AggregateReportMapper());
    }

    public List<CountForDay> generateDayWiseActivities(String dynamic_individual_where, String dynamic_encounter_where, String dynamic_program_enrolment_where, String dynamic_individual_join, String dynamic_encounter_join, String dynamic_enrolment_encounter_join) {
        String baseQuery = "select date for_date, sum(count) activity_count\n" +
                "from (select registration_date date, count(*) count\n" +
                "      from individual e\n" +
                "               join operational_subject_type o on o.subject_type_id = e.subject_type_id\n" +
                "               ${dynamic_individual_join}\n" +
                "      where e.is_voided is false\n" +
                "         ${dynamic_individual_where}\n" +
                "      group by registration_date\n" +
                "      union all\n" +
                "      select date(encounter_date_time) date, count(*) count\n" +
                "      from encounter e\n" +
                "               join operational_encounter_type o on o.encounter_type_id = e.encounter_type_id\n" +
                "               ${dynamic_enrolment_encounter_join}\n" +
                "      where encounter_date_time is not null\n" +
                "        and e.is_voided is false\n" +
                "         ${dynamic_encounter_where}\n" +
                "      group by date(encounter_date_time)\n" +
                "      union all\n" +
                "      select date(encounter_date_time) date, count(*) count\n" +
                "      from program_encounter e\n" +
                "               join operational_encounter_type o on o.encounter_type_id = e.encounter_type_id\n" +
                "               ${dynamic_encounter_join}\n" +
                "      where encounter_date_time is not null\n" +
                "        and e.is_voided is false\n" +
                "         ${dynamic_encounter_where}\n" +
                "      group by date(encounter_date_time)\n" +
                "      union all\n" +
                "      select date(enrolment_date_time) date, count(*) count\n" +
                "      from program_enrolment e\n" +
                "               join operational_program o on o.program_id = e.program_id\n" +
                "               ${dynamic_enrolment_encounter_join}\n" +
                "      where enrolment_date_time is not null\n" +
                "        and e.is_voided is false\n" +
                "         ${dynamic_program_enrolment_where}\n" +
                "      group by date(enrolment_date_time)) data\n" +
                "group by for_date\n" +
                "order by for_date";
        String query = baseQuery
                .replace("${dynamic_individual_where}", dynamic_individual_where)
                .replace("${dynamic_encounter_where}", dynamic_encounter_where)
                .replace("${dynamic_program_enrolment_where}", dynamic_program_enrolment_where)
                .replace("${dynamic_individual_join}", dynamic_individual_join)
                .replace("${dynamic_encounter_join}", dynamic_encounter_join)
                .replace("${dynamic_enrolment_encounter_join}", dynamic_enrolment_encounter_join);
        return jdbcTemplate.query(query, new CountForDayMapper());
    }

    public List<UserActivityResult> generateUserActivityResults(String subjectWhere, String encounterWhere, String enrolmentWhere, String userWhere) {
        String baseQuery = "with registrations as (\n" +
                "    select last_modified_by_id, count(*) as registration_count\n" +
                "    from individual\n" +
                "    where is_voided = false\n" +
                "    ${subjectWhere}\n" +
                "    group by last_modified_by_id\n" +
                "),\n" +
                "     encounters as (\n" +
                "         select last_modified_by_id, count(*) as encounter_count\n" +
                "         from encounter\n" +
                "         where is_voided = false\n" +
                "         ${encounterWhere}\n" +
                "         group by last_modified_by_id\n" +
                "     ),\n" +
                "     enrolments as (\n" +
                "         select last_modified_by_id, count(*) as enrolment_count\n" +
                "         from program_enrolment\n" +
                "         where is_voided = false\n" +
                "         ${enrolmentWhere}\n" +
                "         group by last_modified_by_id\n" +
                "     ),\n" +
                "     program_encounters as (\n" +
                "         select last_modified_by_id, count(*) as program_encounter_count\n" +
                "         from program_encounter\n" +
                "         where is_voided = false\n" +
                "         ${encounterWhere}\n" +
                "         group by last_modified_by_id\n" +
                "     )\n" +
                "select u.id                                              as id,\n" +
                "       coalesce(u.name, u.username)                      as name,\n" +
                "       coalesce(registration_count, 0)                   as registration_count,\n" +
                "       coalesce(encounter_count, 0)                      as encounter_count,\n" +
                "       coalesce(enrolment_count, 0)                      as enrolment_count,\n" +
                "       coalesce(program_encounter_count, 0)              as program_encounter_count,\n" +
                "       coalesce(coalesce(registration_count, 0) + coalesce(encounter_count, 0) + coalesce(enrolment_count, 0) +\n" +
                "                coalesce(program_encounter_count, 0), 0) as total\n" +
                "from users u\n" +
                "         left join registrations r on r.last_modified_by_id = u.id\n" +
                "         left join encounters e on e.last_modified_by_id = u.id\n" +
                "         left join enrolments enl on enl.last_modified_by_id = u.id\n" +
                "         left join program_encounters enc on enc.last_modified_by_id = u.id\n" +
                "where u.is_voided = false and u.organisation_id notnull\n" +
                "       and coalesce(coalesce(registration_count, 0) + coalesce(encounter_count, 0) + coalesce(enrolment_count, 0) +\n" +
                "                coalesce(program_encounter_count, 0), 0) > 0\n" +
                "      ${userWhere}\n" +
                "order by 7 desc\n" +
                "limit 10;";
        String query = baseQuery
                .replace("${subjectWhere}", subjectWhere)
                .replace("${encounterWhere}", encounterWhere)
                .replace("${enrolmentWhere}", enrolmentWhere)
                .replace("${userWhere}", userWhere);
        return jdbcTemplate.query(query, new UserActivityMapper());
    }

    public List<UserActivityResult> generateUserSyncFailures(String syncTelemetryWhere, String userWhere) {
        String baseQuery = "select coalesce(u.name, u.username) as name, \n" +
                "       count(*) as count\n" +
                "from sync_telemetry st\n" +
                "         join users u on st.user_id = u.id\n" +
                "where sync_status = 'incomplete'\n" +
                "and u.is_voided = false and u.organisation_id notnull\n" +
                "${syncTelemetryWhere}\n"+
                "${userWhere}\n"+
                "group by 1\n" +
                "order by 2 desc\n" +
                "limit 10;";
        String query = baseQuery
                .replace("${syncTelemetryWhere}", syncTelemetryWhere)
                .replace("${userWhere}", userWhere);
        return jdbcTemplate.query(query, new UserCountMapper());
    }

    public List<AggregateReportResult> generateUserAppVersions(String userWhere) {
        String baseQuery = "select app_version as indicator,\n" +
                "       count(*)     as count\n" +
                "from users u\n" +
                "         join\n" +
                "     (select user_id,\n" +
                "             app_version,\n" +
                "             row_number() over (partition by user_id order by sync_start_time desc ) as rn\n" +
                "      from sync_telemetry) l on l.user_id = u.id and rn = 1\n" +
                "where u.is_voided = false and u.organisation_id notnull\n" +
                "${userWhere}\n"+
                "group by app_version;";
        String query = baseQuery
                .replace("${userWhere}", userWhere);
        return jdbcTemplate.query(query, new AggregateReportMapper());
    }

    public List<AggregateReportResult> generateUserDeviceModels(String userWhere) {
        String baseQuery = "select device_model as indicator,\n" +
                "       count(*)     as count\n" +
                "from users u\n" +
                "         join\n" +
                "     (select user_id,\n" +
                "             coalesce(device_info ->> 'brand', device_name)                          as device_model,\n" +
                "             row_number() over (partition by user_id order by sync_start_time desc ) as rn\n" +
                "      from sync_telemetry) l on l.user_id = u.id and rn = 1\n" +
                "where u.is_voided = false and u.organisation_id notnull \n" +
                "${userWhere}\n"+
                "group by device_model;";
        String query = baseQuery
                .replace("${userWhere}", userWhere);
        return jdbcTemplate.query(query, new AggregateReportMapper());
    }

    public List<UserActivityResult> generateUserDetails(String userWhere) {
        String baseQuery = "select coalesce(u.name, u.username) as name,\n" +
                "       app_version,\n" +
                "       device_model,\n" +
                "       sync_start_time\n" +
                "from users u\n" +
                "         join\n" +
                "     (select user_id,\n" +
                "             app_version,\n" +
                "             coalesce(device_info ->> 'brand', device_name)                          as device_model,\n" +
                "             sync_start_time,\n" +
                "             row_number() over (partition by user_id order by sync_start_time desc ) as rn\n" +
                "      from sync_telemetry\n" +
                "      where sync_status = 'complete') l on l.user_id = u.id and rn = 1\n" +
                "where u.is_voided = false\n" +
                "  and u.organisation_id notnull\n" +
                "  ${userWhere}\n"+
                "order by 1 desc;";
        String query = baseQuery
                .replace("${userWhere}", userWhere);
        return jdbcTemplate.query(query, new UserDetailsMapper());
    }

    public List<AggregateReportResult> generateCompletedVisitsOnTimeByProportion(String proportionCondition, String encounterWhere, String userWhere) {
        String baseQuery = "with program_enc_data as (\n" +
                "    select last_modified_by_id,\n" +
                "           count(*) filter ( where encounter_date_time <= max_visit_date_time )                       visits_done_on_time,\n" +
                "           count(*) filter ( where encounter_date_time notnull and earliest_visit_date_time notnull ) total_scheduled\n" +
                "    from program_encounter\n" +
                "    where is_voided = false\n" +
                "    ${encounterWhere}\n" +
                "    group by last_modified_by_id\n" +
                "),\n" +
                "     general_enc_data as (\n" +
                "         select last_modified_by_id,\n" +
                "                count(*) filter ( where encounter_date_time <= max_visit_date_time )              visits_done_on_time,\n" +
                "                count(*)\n" +
                "                filter ( where encounter_date_time notnull and earliest_visit_date_time notnull ) total_scheduled\n" +
                "         from encounter\n" +
                "         where is_voided = false\n" +
                "         ${encounterWhere}\n" +
                "         group by last_modified_by_id\n" +
                "     )\n" +
                "select coalesce(u.name, u.username)                                                as indicator,\n" +
                "       coalesce(ged.visits_done_on_time, 0) + coalesce(ped.visits_done_on_time, 0) as count\n" +
                "from users u\n" +
                "          join general_enc_data ged on ged.last_modified_by_id = u.id\n" +
                "          join program_enc_data ped on ped.last_modified_by_id = u.id\n" +
                "where u.organisation_id notnull\n" +
                "  and is_voided = false\n" +
                "  and coalesce(ged.visits_done_on_time, 0) + coalesce(ped.visits_done_on_time, 0) > 0\n" +
                "  ${userWhere}\n" +
                "  and ((coalesce(ged.visits_done_on_time, 0.0) + coalesce(ped.visits_done_on_time, 0.0)) /\n" +
                "       nullif((coalesce(ged.total_scheduled, 0) + coalesce(ped.total_scheduled, 0)), 0)) ${proportion_condition}\n";
        String query = baseQuery
                .replace("${proportion_condition}", proportionCondition)
                .replace("${encounterWhere}", encounterWhere)
                .replace("${userWhere}", userWhere);
        return jdbcTemplate.query(query, new AggregateReportMapper());
    }

    public List<AggregateReportResult> generateUserCancellingMostVisits(String encounterWhere, String userWhere) {
        String baseQuery = "with program_enc_data as (\n" +
                "    select last_modified_by_id,\n" +
                "           count(*) filter ( where cancel_date_time notnull ) cancelled_visits\n" +
                "    from program_encounter\n" +
                "    where is_voided = false\n" +
                "    ${encounterWhere}\n" +
                "    group by last_modified_by_id\n" +
                "),\n" +
                "     general_enc_data as (\n" +
                "         select last_modified_by_id,\n" +
                "                count(*) filter ( where cancel_date_time notnull ) cancelled_visits\n" +
                "         from encounter\n" +
                "         where is_voided = false\n" +
                "         ${encounterWhere}\n" +
                "         group by last_modified_by_id\n" +
                "     )\n" +
                "select coalesce(u.name, u.username)                                          as indicator,\n" +
                "       coalesce(ged.cancelled_visits, 0) + coalesce(ped.cancelled_visits, 0) as count\n" +
                "from users u\n" +
                "          join general_enc_data ged on ged.last_modified_by_id = u.id\n" +
                "          join program_enc_data ped on ped.last_modified_by_id = u.id\n" +
                "where u.organisation_id notnull\n" +
                "  and is_voided = false\n" +
                "  and coalesce(ged.cancelled_visits, 0) + coalesce(ped.cancelled_visits, 0) > 0 \n" +
                "  ${userWhere}\n" +
                "order by coalesce(ged.cancelled_visits, 0.0) + coalesce(ped.cancelled_visits, 0.0) desc\n" +
                "limit 5;";
        String query = baseQuery
                .replace("${encounterWhere}", encounterWhere)
                .replace("${userWhere}", userWhere);
        return jdbcTemplate.query(query, new AggregateReportMapper());
    }
}
