package org.avni.report;

import org.avni.domain.JsonObject;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static java.lang.String.format;

@Service
public class ReportService {

    private final AvniReportRepository avniReportRepository;

    public ReportService(AvniReportRepository avniReportRepository) {
        this.avniReportRepository = avniReportRepository;
    }


    public JsonObject allRegistrations(String startDate, String endDate, List<Long> subjectTypeIds) {
        List<AggregateReportResult> aggregateReportResults = avniReportRepository.generateAggregatesForEntityByType(
                "individual",
                "operational_subject_type",
                "subject_type_id",
                getApplicableSubjectWheres(startDate, endDate, subjectTypeIds)
        );
        return new JsonObject()
                .with("total", getTotalCount(aggregateReportResults))
                .with("data", aggregateReportResults);
    }

    public JsonObject allEnrolments(String startDate, String endDate, List<Long> programIds) {
        List<AggregateReportResult> aggregateReportResults = avniReportRepository.generateAggregatesForEntityByType(
                "program_enrolment",
                "operational_program",
                "program_id",
                getApplicableEnrolmentWheres(startDate, endDate, programIds)
        );
        return new JsonObject()
                .with("total", getTotalCount(aggregateReportResults))
                .with("data", aggregateReportResults);
    }

    public JsonObject completedVisits(String startDate, String endDate, List<Long> encounterTypeIds) {
        List<AggregateReportResult> programEncResults = avniReportRepository.generateAggregatesForEntityByType("program_encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and encounter_date_time notnull and cancel_date_time isnull ".concat(getApplicableEncounterWheres(startDate, endDate, encounterTypeIds))
        );
        List<AggregateReportResult> generalEncResults = avniReportRepository.generateAggregatesForEntityByType("encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and encounter_date_time notnull and cancel_date_time isnull ".concat(getApplicableEncounterWheres(startDate, endDate, encounterTypeIds))
        );
        programEncResults.addAll(generalEncResults);
        return new JsonObject()
                .with("total", getTotalCount(programEncResults))
                .with("data", programEncResults);
    }

    public JsonObject dailyActivities(String startDate, String endDate, List<Long> subjectTypeIds, List<Long> programIds, List<Long> encounterTypeIds) {
        String dynamicSubjectWheres = getApplicableSubjectWheres(startDate, endDate, subjectTypeIds);
        String dynamicEncounterWheres = getApplicableEncounterWheres(startDate, endDate, encounterTypeIds);
        String dynamicEnrolmentWheres = getApplicableEnrolmentWheres(startDate, endDate, programIds);
        List<CountForDay> countsForDay = avniReportRepository.generateDayWiseActivities(dynamicSubjectWheres, dynamicEncounterWheres, dynamicEnrolmentWheres);
        return new JsonObject()
                .with("data", countsForDay);
    }

    public JsonObject cancelledVisits(String startDate, String endDate, List<Long> encounterTypeIds) {
        List<AggregateReportResult> programEncResults = avniReportRepository.generateAggregatesForEntityByType("program_encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and cancel_date_time notnull ".concat(getApplicableEncounterWheres(startDate, endDate, encounterTypeIds))
        );
        List<AggregateReportResult> generalEncResults = avniReportRepository.generateAggregatesForEntityByType("encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and cancel_date_time notnull ".concat(getApplicableEncounterWheres(startDate, endDate, encounterTypeIds))
        );
        programEncResults.addAll(generalEncResults);
        return new JsonObject()
                .with("total", getTotalCount(programEncResults))
                .with("data", programEncResults);
    }

    public JsonObject onTimeVisits(String startDate, String endDate, List<Long> encounterTypeIds) {
        List<AggregateReportResult> programEncResults = avniReportRepository.generateAggregatesForEntityByType("program_encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and encounter_date_time notnull and max_visit_date_time notnull and encounter_date_time <= max_visit_date_time ".concat(getApplicableEncounterWheres(startDate, endDate, encounterTypeIds))
        );
        List<AggregateReportResult> generalEncResults = avniReportRepository.generateAggregatesForEntityByType("encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and encounter_date_time notnull and max_visit_date_time notnull and encounter_date_time <= max_visit_date_time ".concat(getApplicableEncounterWheres(startDate, endDate, encounterTypeIds))
        );
        programEncResults.addAll(generalEncResults);
        return new JsonObject()
                .with("total", getTotalCount(programEncResults))
                .with("data", programEncResults);
    }

    public JsonObject programExits(String startDate, String endDate, List<Long> programIds) {
        List<AggregateReportResult> aggregateReportResults = avniReportRepository.generateAggregatesForEntityByType(
                "program_enrolment",
                "operational_program",
                "program_id",
                "and program_exit_date_time notnull ".concat(getApplicableEnrolmentWheres(startDate, endDate, programIds))
        );
        return new JsonObject()
                .with("total", getTotalCount(aggregateReportResults))
                .with("data", aggregateReportResults);
    }

    private Long getTotalCount(List<AggregateReportResult> aggregateReportResults) {
        return aggregateReportResults.stream().map(AggregateReportResult::getValue).reduce(0L, Long::sum);
    }

    private String join(List<Long> lists) {
        return lists.isEmpty() ? "" : lists.stream().map(String::valueOf)
                .collect(Collectors.joining(","));
    }

    private String getApplicableSubjectWheres(String startDate, String endDate, List<Long> subjectTypeIds) {
        Set<String> wheres = new HashSet<>();
        if (startDate != null) {
            wheres.add(format("and registration_date::date between '%s'::date and '%s'::date", startDate, endDate));
        }
        if (!subjectTypeIds.isEmpty()) {
            wheres.add(format("and o.subject_type_id in (%s)", join(subjectTypeIds)));
        }
        return String.join("\n", wheres);
    }

    private String getApplicableEnrolmentWheres(String startDate, String endDate, List<Long> programIds) {
        Set<String> wheres = new HashSet<>();
        if (startDate != null) {
            wheres.add(format("and enrolment_date_time::date between '%s'::date and '%s'::date", startDate, endDate));
        }
        if (!programIds.isEmpty()) {
            wheres.add(format("and o.program_id in (%s)", join(programIds)));
        }
        return String.join("\n", wheres);
    }

    private String getApplicableEncounterWheres(String startDate, String endDate, List<Long> encounterTypeIds) {
        Set<String> wheres = new HashSet<>();
        if (startDate != null) {
            wheres.add(format("and encounter_date_time::date between '%s'::date and '%s'::date", startDate, endDate));
        }
        if (!encounterTypeIds.isEmpty()) {
            wheres.add(format("and o.encounter_type_id in (%s)", join(encounterTypeIds)));
        }
        return String.join("\n", wheres);
    }

}
