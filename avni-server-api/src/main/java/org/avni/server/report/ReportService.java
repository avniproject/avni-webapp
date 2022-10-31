package org.avni.server.report;

import org.avni.server.domain.JsonObject;
import org.avni.server.util.S;
import org.joda.time.DateTime;
import org.springframework.stereotype.Service;

import java.util.*;

import static java.lang.String.format;

@Service
public class ReportService {

    private final AvniReportRepository avniReportRepository;

    public ReportService(AvniReportRepository avniReportRepository) {
        this.avniReportRepository = avniReportRepository;
    }


    public JsonObject allRegistrations(String startDate, String endDate, List<Long> subjectTypeIds, List<Long> lowestLocationIds) {
        List<AggregateReportResult> aggregateReportResults = avniReportRepository.generateAggregatesForEntityByType(
                "individual",
                "operational_subject_type",
                "subject_type_id",
                getApplicableSubjectWheres(startDate, endDate, subjectTypeIds, lowestLocationIds),
                getSubjectJoins(lowestLocationIds)
        );
        return new JsonObject()
                .with("total", getTotalCount(aggregateReportResults))
                .with("data", aggregateReportResults);
    }

    public JsonObject allEnrolments(String startDate, String endDate, List<Long> programIds, List<Long> lowestLocationIds) {
        List<AggregateReportResult> aggregateReportResults = avniReportRepository.generateAggregatesForEntityByType(
                "program_enrolment",
                "operational_program",
                "program_id",
                getApplicableEnrolmentWheres(startDate, endDate, programIds, lowestLocationIds),
                getEnrolmentOrEncounterJoins(lowestLocationIds)
        );
        return new JsonObject()
                .with("total", getTotalCount(aggregateReportResults))
                .with("data", aggregateReportResults);
    }

    public JsonObject completedVisits(String startDate, String endDate, List<Long> encounterTypeIds, List<Long> lowestLocationIds) {
        List<AggregateReportResult> programEncResults = avniReportRepository.generateAggregatesForEntityByType("program_encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and encounter_date_time notnull and cancel_date_time isnull ".concat(getApplicableEncounterWheres(startDate, endDate, encounterTypeIds, lowestLocationIds)),
                getProgramEncounterJoins(lowestLocationIds)
        );
        List<AggregateReportResult> generalEncResults = avniReportRepository.generateAggregatesForEntityByType("encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and encounter_date_time notnull and cancel_date_time isnull ".concat(getApplicableEncounterWheres(startDate, endDate, encounterTypeIds, lowestLocationIds)),
                getEnrolmentOrEncounterJoins(lowestLocationIds)
        );
        programEncResults.addAll(generalEncResults);
        return new JsonObject()
                .with("total", getTotalCount(programEncResults))
                .with("data", programEncResults);
    }

    public JsonObject dailyActivities(String startDate, String endDate, List<Long> subjectTypeIds, List<Long> programIds, List<Long> encounterTypeIds, List<Long> lowestLocationIds) {
        if (startDate == null) {
            int currentYear = new DateTime().getYear();
            startDate = format("%s-%s-%s", currentYear, "01", "01");
            endDate = format("%s-%s-%s", currentYear, "12", "01");
        }
        String dynamicSubjectWheres = getApplicableSubjectWheres(startDate, endDate, subjectTypeIds, lowestLocationIds);
        String dynamicEncounterWheres = getApplicableEncounterWheres(startDate, endDate, encounterTypeIds, lowestLocationIds);
        String dynamicEnrolmentWheres = getApplicableEnrolmentWheres(startDate, endDate, programIds, lowestLocationIds);
        String subjectJoins = getSubjectJoins(lowestLocationIds);
        String enrolmentEncounterJoins = getEnrolmentOrEncounterJoins(lowestLocationIds);
        String programEncounterJoins = getProgramEncounterJoins(lowestLocationIds);
        List<CountForDay> countsForDay = avniReportRepository.generateDayWiseActivities(dynamicSubjectWheres, dynamicEncounterWheres, dynamicEnrolmentWheres, subjectJoins, programEncounterJoins, enrolmentEncounterJoins);
        return new JsonObject()
                .with("data", countsForDay);
    }

    public JsonObject cancelledVisits(String startDate, String endDate, List<Long> encounterTypeIds, List<Long> lowestLocationIds) {
        List<AggregateReportResult> programEncResults = avniReportRepository.generateAggregatesForEntityByType("program_encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and cancel_date_time notnull ".concat(getApplicableEncounterWheres(startDate, endDate, encounterTypeIds, lowestLocationIds)),
                getProgramEncounterJoins(lowestLocationIds)
        );
        List<AggregateReportResult> generalEncResults = avniReportRepository.generateAggregatesForEntityByType("encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and cancel_date_time notnull ".concat(getApplicableEncounterWheres(startDate, endDate, encounterTypeIds, lowestLocationIds)),
                getEnrolmentOrEncounterJoins(lowestLocationIds)
        );
        programEncResults.addAll(generalEncResults);
        return new JsonObject()
                .with("total", getTotalCount(programEncResults))
                .with("data", programEncResults);
    }

    public JsonObject onTimeVisits(String startDate, String endDate, List<Long> encounterTypeIds, List<Long> lowestLocationIds) {
        List<AggregateReportResult> programEncResults = avniReportRepository.generateAggregatesForEntityByType("program_encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and encounter_date_time notnull and max_visit_date_time notnull and encounter_date_time <= max_visit_date_time ".concat(getApplicableEncounterWheres(startDate, endDate, encounterTypeIds, lowestLocationIds)),
                getProgramEncounterJoins(lowestLocationIds)
        );
        List<AggregateReportResult> generalEncResults = avniReportRepository.generateAggregatesForEntityByType("encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and encounter_date_time notnull and max_visit_date_time notnull and encounter_date_time <= max_visit_date_time ".concat(getApplicableEncounterWheres(startDate, endDate, encounterTypeIds, lowestLocationIds)),
                getEnrolmentOrEncounterJoins(lowestLocationIds)
        );
        programEncResults.addAll(generalEncResults);
        return new JsonObject()
                .with("total", getTotalCount(programEncResults))
                .with("data", programEncResults);
    }

    public JsonObject programExits(String startDate, String endDate, List<Long> programIds, List<Long> lowestLocationIds) {
        List<AggregateReportResult> aggregateReportResults = avniReportRepository.generateAggregatesForEntityByType(
                "program_enrolment",
                "operational_program",
                "program_id",
                "and program_exit_date_time notnull ".concat(getApplicableEnrolmentWheres(startDate, endDate, programIds, lowestLocationIds)),
                getEnrolmentOrEncounterJoins(lowestLocationIds)
        );
        return new JsonObject()
                .with("total", getTotalCount(aggregateReportResults))
                .with("data", aggregateReportResults);
    }

    public String getDateDynamicWhere(String startDate, String endDate, String columnName) {
        if (startDate != null) {
            return format("and %s::date between '%s'::date and '%s'::date", columnName, startDate, endDate);
        }
        return "";
    }

    public String getDynamicUserWhere(List<Long> userIds, String columnName) {
        if (!userIds.isEmpty()) {
            return format("and %s in (%s)", columnName, S.joinLongToList(userIds));
        }
        return "";
    }

    private Long getTotalCount(List<AggregateReportResult> aggregateReportResults) {
        return aggregateReportResults.stream().map(AggregateReportResult::getValue).reduce(0L, Long::sum);
    }

    private String getApplicableSubjectWheres(String startDate, String endDate, List<Long> subjectTypeIds, List<Long> locationIds) {
        Set<String> wheres = new HashSet<>();
        if (startDate != null) {
            wheres.add(format("and registration_date::date between '%s'::date and '%s'::date", startDate, endDate));
        }
        if (!subjectTypeIds.isEmpty()) {
            wheres.add(format("and o.subject_type_id in (%s)", S.joinLongToList(subjectTypeIds)));
        }
        if (!locationIds.isEmpty()) {
            wheres.add(format("and a.id in (%s)", S.joinLongToList(locationIds)));
        }
        return String.join("\n", wheres);
    }

    private String getApplicableEnrolmentWheres(String startDate, String endDate, List<Long> programIds, List<Long> locationIds) {
        Set<String> wheres = new HashSet<>();
        if (startDate != null) {
            wheres.add(format("and enrolment_date_time::date between '%s'::date and '%s'::date", startDate, endDate));
        }
        if (!programIds.isEmpty()) {
            wheres.add(format("and o.program_id in (%s)", S.joinLongToList(programIds)));
        }
        if (!locationIds.isEmpty()) {
            wheres.add(format("and a.id in (%s)", S.joinLongToList(locationIds)));
        }
        return String.join("\n", wheres);
    }

    private String getApplicableEncounterWheres(String startDate, String endDate, List<Long> encounterTypeIds, List<Long> locationIds) {
        Set<String> wheres = new HashSet<>();
        if (startDate != null) {
            wheres.add(format("and encounter_date_time::date between '%s'::date and '%s'::date", startDate, endDate));
        }
        if (!encounterTypeIds.isEmpty()) {
            wheres.add(format("and o.encounter_type_id in (%s)", S.joinLongToList(encounterTypeIds)));
        }
        if (!locationIds.isEmpty()) {
            wheres.add(format("and a.id in (%s)", S.joinLongToList(locationIds)));
        }
        return String.join("\n", wheres);
    }

    private String getSubjectJoins(List<Long> locationIds) {
        return locationIds.isEmpty() ? "" : "join address_level a on a.id = e.address_id\n";
    }

    private String getEnrolmentOrEncounterJoins(List<Long> locationIds) {
        String joinCondition = "join individual i on i.id = e.individual_id\n" +
                "join address_level a on a.id = i.address_id\n";
        return locationIds.isEmpty() ? "" : joinCondition;
    }

    private String getProgramEncounterJoins(List<Long> locationIds) {
        String joinCondition = "join program_enrolment enl on enl.id = e.program_enrolment_id\n" +
                "join individual i on i.id = enl.individual_id\n" +
                "join address_level a on a.id = i.address_id\n";
        return locationIds.isEmpty() ? "" : joinCondition;
    }

}
