package org.openchs.report;

import org.openchs.application.FormMapping;
import org.openchs.domain.Concept;

import java.util.List;

public interface AvniReportGenerator {

    List<AggregateReportResult> generateAggregateReport(Concept concept, FormMapping formMapping);


}
