package org.avni.server.report;

import org.joda.time.DateTime;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class UserDetailsMapper implements RowMapper<UserActivityResult> {
    @Override
    public UserActivityResult mapRow(ResultSet rs, int rowNum) throws SQLException {
        UserActivityResult userActivityResult = new UserActivityResult();
        userActivityResult.setUserName(rs.getString("name"));
        userActivityResult.setAppVersion(rs.getString("app_version"));
        userActivityResult.setDeviceModel(rs.getString("device_model"));
        userActivityResult.setLastSuccessfulSync(new DateTime(rs.getDate("sync_start_time")));
        return userActivityResult;
    }
}
