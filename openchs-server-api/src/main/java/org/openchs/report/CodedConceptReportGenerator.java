package org.openchs.report;

import org.openchs.application.FormMapping;
import org.openchs.domain.Concept;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CodedConceptReportGenerator implements AvniReportGenerator {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final ReportHelper reportHelper;

    @Autowired
    public CodedConceptReportGenerator(NamedParameterJdbcTemplate jdbcTemplate,
                                       ReportHelper reportHelper) {
        this.jdbcTemplate = jdbcTemplate;
        this.reportHelper = reportHelper;
    }

    @Override
    public List<AggregateReportResult> generateAggregateReport(Concept concept, FormMapping formMapping) {
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
        return jdbcTemplate.query(reportHelper.buildQuery(formMapping, queryWithConceptUUID), new AggregateReportMapper());
    }
}
