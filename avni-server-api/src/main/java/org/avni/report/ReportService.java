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


    public JsonObject allRegistrations(String startDate, String endDate, List<Long> locationIds, List<Long> subjectTypeIds, List<Long> programIds, List<Long> encounterTypeIds) {
        Set<String> wheres = new HashSet<>();
        Set<String> joins = new HashSet<>();
        if (startDate != null) {
            wheres.add(format("and registration_date between '%s'::date and '%s'::date", startDate, endDate));
        }
        if (!locationIds.isEmpty()) {
            joins.add("join address_level a on a.id = e.address_id");
            wheres.add(format("and a.id in (%s)", join(locationIds)));
        }
        if (!subjectTypeIds.isEmpty()) {
            wheres.add(format("and o.subject_type_id in (%s)", join(subjectTypeIds)));
        }
        List<AggregateReportResult> aggregateReportResults = avniReportRepository.generateAggregatesForEntityByType(
                "individual",
                "operational_subject_type",
                "subject_type_id",
                String.join("\n", wheres),
                String.join("\n", joins)
        );
        return new JsonObject()
                .with("total", getTotalCount(aggregateReportResults))
                .with("data", aggregateReportResults);
    }

    private String join(List<Long> lists) {
        return lists.isEmpty() ? "" : lists.stream().map(String::valueOf)
                .collect(Collectors.joining(","));
    }

    public JsonObject allEnrolments(String startDate, String endDate, List<Long> locationIds, List<Long> subjectTypeIds, List<Long> programIds, List<Long> encounterTypeIds) {
        Set<String> wheres = new HashSet<>();
        Set<String> joins = new HashSet<>();
        if (startDate != null) {
            wheres.add(format("and enrolment_date_time::date between '%s'::date and '%s'::date", startDate, endDate));
        }
        if (!locationIds.isEmpty()) {
            joins.add("join individual i on i.id = e.individual_id");
            joins.add("join address_level a on a.id = i.address_id");
            wheres.add(format("and a.id in (%s)", join(locationIds)));
        }
        if (!programIds.isEmpty()) {
            wheres.add(format("and o.program_id in (%s)", join(programIds)));
        }
        List<AggregateReportResult> aggregateReportResults = avniReportRepository.generateAggregatesForEntityByType(
                "program_enrolment",
                "operational_program",
                "program_id",
                String.join("\n", wheres),
                String.join("\n", joins)
        );
        return new JsonObject()
                .with("total", getTotalCount(aggregateReportResults))
                .with("data", aggregateReportResults);
    }

    public JsonObject completedVisits(String startDate, String endDate, List<Long> locationIds, List<Long> subjectTypeIds, List<Long> programIds, List<Long> encounterTypeIds) {
        List<AggregateReportResult> programEncResults = avniReportRepository.generateAggregatesForEntityByType("program_encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and encounter_date_time notnull and cancel_date_time isnull",
                "");
        List<AggregateReportResult> generalEncResults = avniReportRepository.generateAggregatesForEntityByType("encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and encounter_date_time notnull and cancel_date_time isnull",
                "");
        programEncResults.addAll(generalEncResults);
        return new JsonObject()
                .with("total", getTotalCount(programEncResults))
                .with("data", programEncResults);
    }

    public JsonObject dailyActivities(String startDate, String endDate, List<Long> locationIds, List<Long> subjectTypeIds, List<Long> programIds, List<Long> encounterTypeIds) {
        List<CountForDay> countsForDay = avniReportRepository.generateDayWiseActivities();
        return new JsonObject()
                .with("data", countsForDay);
    }

    private Long getTotalCount(List<AggregateReportResult> aggregateReportResults) {
        return aggregateReportResults.stream().map(AggregateReportResult::getValue).reduce(0L, Long::sum);
    }

    public JsonObject cancelledVisits(String startDate, String endDate, List<Long> locationIds, List<Long> subjectTypeIds, List<Long> programIds, List<Long> encounterTypeIds) {
        List<AggregateReportResult> programEncResults = avniReportRepository.generateAggregatesForEntityByType("program_encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and cancel_date_time notnull",
                "");
        List<AggregateReportResult> generalEncResults = avniReportRepository.generateAggregatesForEntityByType("encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and cancel_date_time notnull",
                "");
        programEncResults.addAll(generalEncResults);
        return new JsonObject()
                .with("total", getTotalCount(programEncResults))
                .with("data", programEncResults);
    }

    public JsonObject onTimeVisits(String startDate, String endDate, List<Long> locationIds, List<Long> subjectTypeIds, List<Long> programIds, List<Long> encounterTypeIds) {
        List<AggregateReportResult> programEncResults = avniReportRepository.generateAggregatesForEntityByType("program_encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and encounter_date_time notnull and max_visit_date_time notnull and encounter_date_time <= max_visit_date_time",
                "");
        List<AggregateReportResult> generalEncResults = avniReportRepository.generateAggregatesForEntityByType("encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and encounter_date_time notnull and max_visit_date_time notnull and encounter_date_time <= max_visit_date_time",
                "");
        programEncResults.addAll(generalEncResults);
        return new JsonObject()
                .with("total", getTotalCount(programEncResults))
                .with("data", programEncResults);
    }

    public JsonObject programExits(String startDate, String endDate, List<Long> locationIds, List<Long> subjectTypeIds, List<Long> programIds, List<Long> encounterTypeIds) {
        List<AggregateReportResult> aggregateReportResults = avniReportRepository.generateAggregatesForEntityByType(
                "program_enrolment",
                "operational_program",
                "program_id",
                "and program_exit_date_time notnull",
                "");
        return new JsonObject()
                .with("total", getTotalCount(aggregateReportResults))
                .with("data", aggregateReportResults);
    }
}
