package org.avni.server.report;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class UserActivityMapper implements RowMapper<UserActivityResult> {
    @Override
    public UserActivityResult mapRow(ResultSet rs, int rowNum) throws SQLException {
        UserActivityResult userActivityResult = new UserActivityResult();
        userActivityResult.setId(rs.getLong("id"));
        userActivityResult.setUserName(rs.getString("name"));
        userActivityResult.setRegistrationCount(rs.getLong("registration_count"));
        userActivityResult.setGeneralEncounterCount(rs.getLong("encounter_count"));
        userActivityResult.setProgramEnrolmentCount(rs.getLong("enrolment_count"));
        userActivityResult.setProgramEncounterCount(rs.getLong("program_encounter_count"));
        return userActivityResult;
    }
}

