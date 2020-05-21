package org.openchs.dao;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class JobStatusMapper implements RowMapper<JobStatus> {
    public JobStatus mapRow(ResultSet rs, int rowNum) throws SQLException {
        JobStatus jobStatus = new JobStatus();
        jobStatus.setStatus(rs.getString("status"));
        jobStatus.setExitStatus(rs.getString("exit_code"));
        jobStatus.setCreateTime(rs.getDate("create_time"));
        jobStatus.setStartTime(rs.getDate("start_time"));
        jobStatus.setEndTime(rs.getDate("end_time"));
        jobStatus.setUuid(rs.getString("uuid"));
        jobStatus.setFileName(rs.getString("fileName"));
        jobStatus.setNoOfLines(rs.getLong("noOfLines"));
        jobStatus.setS3Key(rs.getString("s3Key"));
        jobStatus.setUserId(rs.getLong("userId"));
        jobStatus.setType(rs.getString("job_type"));
        jobStatus.setTotal(rs.getInt("read_count"));
        jobStatus.setCompleted(rs.getInt("write_count"));
        jobStatus.setSkipped(rs.getInt("write_skip_count"));
        return jobStatus;
    }
}
