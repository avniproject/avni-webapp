package org.openchs.report;

import org.openchs.domain.JsonObject;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportService {

    private final AvniReportRepository avniReportRepository;

    public ReportService(AvniReportRepository avniReportRepository) {
        this.avniReportRepository = avniReportRepository;
    }


    public JsonObject allRegistrations() {
        List<AggregateReportResult> aggregateReportResults = avniReportRepository.generateAggregatesForEntityByType(
                "individual",
                "operational_subject_type",
                "subject_type_id",
                "");
        return new JsonObject()
                .with("total", getTotalCount(aggregateReportResults))
                .with("data", aggregateReportResults);
    }

    public JsonObject allEnrolments() {
        List<AggregateReportResult> aggregateReportResults = avniReportRepository.generateAggregatesForEntityByType(
                "program_enrolment",
                "operational_program",
                "program_id",
                "");
        return new JsonObject()
                .with("total", getTotalCount(aggregateReportResults))
                .with("data", aggregateReportResults);
    }

    public JsonObject completedVisits() {
        List<AggregateReportResult> programEncResults = avniReportRepository.generateAggregatesForEntityByType("program_encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and encounter_date_time notnull and cancel_date_time isnull");
        List<AggregateReportResult> generalEncResults = avniReportRepository.generateAggregatesForEntityByType("encounter",
                "operational_encounter_type",
                "encounter_type_id",
                "and encounter_date_time notnull and cancel_date_time isnull");
        programEncResults.addAll(generalEncResults);
        return new JsonObject()
                .with("total", getTotalCount(programEncResults))
                .with("data", programEncResults);
    }

    private Long getTotalCount(List<AggregateReportResult> aggregateReportResults) {
        return aggregateReportResults.stream().map(AggregateReportResult::getCount).reduce(0L, Long::sum);
    }
}
