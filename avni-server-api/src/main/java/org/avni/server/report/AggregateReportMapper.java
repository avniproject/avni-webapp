package org.avni.server.report;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class AggregateReportMapper implements RowMapper<AggregateReportResult> {

    @Override
    public AggregateReportResult mapRow(ResultSet rs, int rowNum) throws SQLException {
        AggregateReportResult aggregateReportResult = new AggregateReportResult();
        aggregateReportResult.setLabel(rs.getString("indicator"));
        aggregateReportResult.setValue(rs.getLong("count"));
        aggregateReportResult.setId(rs.getString("indicator"));

        return aggregateReportResult;
    }
}
