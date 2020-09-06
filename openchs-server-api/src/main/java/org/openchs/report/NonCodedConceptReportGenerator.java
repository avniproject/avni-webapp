package org.openchs.report;

import org.openchs.application.FormMapping;
import org.openchs.domain.Concept;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NonCodedConceptReportGenerator implements AvniReportGenerator {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final ReportHelper reportHelper;

    @Autowired
    public NonCodedConceptReportGenerator(NamedParameterJdbcTemplate jdbcTemplate,
                                          ReportHelper reportHelper) {
        this.jdbcTemplate = jdbcTemplate;
        this.reportHelper = reportHelper;
    }

    @Override
    public List<AggregateReportResult> generateAggregateReport(Concept concept, FormMapping formMapping) {
        String query = "select ${obsColumn} ->> ${conceptUUID} as indicator,\n" +
                "       count(*)                        as count\n" +
                "from ${dynamicFrom}\n" +
                "where ${dynamicWhere}\n" +
                "group by 1";
        String queryWithConceptUUID = query.replace("${conceptUUID}", "'" + concept.getUuid() + "'");
        return jdbcTemplate.query(reportHelper.buildQuery(formMapping, queryWithConceptUUID), new AggregateReportMapper());
    }
}
