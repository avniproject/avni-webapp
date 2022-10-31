package org.avni.server.dao;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class JobStatusMapper implements RowMapper<JobStatus> {
    public JobStatus mapRow(ResultSet rs, int rowNum) throws SQLException {
        JobStatus jobStatus = new JobStatus();
        jobStatus.setStatus(rs.getString("status"));
        jobStatus.setExitStatus(rs.getString("exit_code"));
        jobStatus.setCreateTime(rs.getTimestamp("create_time"));
        jobStatus.setStartTime(rs.getTimestamp("start_time"));
        jobStatus.setEndTime(rs.getTimestamp("end_time"));
        jobStatus.setUuid(rs.getString("uuid"));
        jobStatus.setFileName(rs.getString("fileName"));
        jobStatus.setNoOfLines(rs.getLong("noOfLines"));
        jobStatus.setS3Key(rs.getString("s3Key"));
        jobStatus.setUserId(rs.getLong("userId"));
        jobStatus.setType(rs.getString("job_type"));
        jobStatus.setTotal(rs.getInt("read_count"));
        jobStatus.setCompleted(rs.getInt("write_count"));
        jobStatus.setSkipped(rs.getInt("write_skip_count"));
        jobStatus.setStartDate(rs.getTimestamp("startDate"));
        jobStatus.setEndDate(rs.getTimestamp("endDate"));
        jobStatus.setSubjectTypeUUID(rs.getString("subjectTypeUUID"));
        jobStatus.setProgramUUID(rs.getString("programUUID"));
        jobStatus.setEncounterTypeUUID(rs.getString("encounterTypeUUID"));
        jobStatus.setReportType(rs.getString("reportType"));
        return jobStatus;
    }
}
