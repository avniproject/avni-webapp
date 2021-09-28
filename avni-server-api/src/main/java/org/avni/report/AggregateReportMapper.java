package org.avni.report;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class AggregateReportMapper implements RowMapper<AggregateReportResult> {

    @Override
    public AggregateReportResult mapRow(ResultSet rs, int rowNum) throws SQLException {
        AggregateReportResult aggregateReportResult = new AggregateReportResult();
        aggregateReportResult.setIndicator(rs.getString("indicator"));
        aggregateReportResult.setCount(rs.getLong("count"));

        return aggregateReportResult;
    }
}
