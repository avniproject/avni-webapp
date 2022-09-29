package org.avni.server.report;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class CountForDayMapper implements RowMapper<CountForDay> {

    @Override
    public CountForDay mapRow(ResultSet rs, int rowNum) throws SQLException {
        CountForDay countForDay = new CountForDay();
        countForDay.setDay(rs.getDate("for_date"));
        countForDay.setValue(rs.getLong("activity_count"));
        return countForDay;
    }
}
