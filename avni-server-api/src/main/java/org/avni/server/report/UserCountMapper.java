package org.avni.server.report;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class UserCountMapper implements RowMapper<UserActivityResult> {
    @Override
    public UserActivityResult mapRow(ResultSet rs, int rowNum) throws SQLException {
        UserActivityResult userActivityResult = new UserActivityResult();
        userActivityResult.setUserName(rs.getString("name"));
        userActivityResult.setCount(rs.getLong("count"));
        return userActivityResult;
    }
}
