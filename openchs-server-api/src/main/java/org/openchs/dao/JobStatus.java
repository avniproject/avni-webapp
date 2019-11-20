package org.openchs.dao;

import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.ExitStatus;

import java.util.Date;

public class JobStatus {
    private String uuid;
    private String fileName;
    private String s3Key;
    private Long userId;
    private String type;
    private BatchStatus status;
    private ExitStatus exitStatus;
    private Date startTime;
    private Date endTime;
    private int total;
    private int completed;
    private int skipped;
    private Date createTime;
    private Long noOfLines;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getS3Key() {
        return s3Key;
    }

    public void setS3Key(String s3Key) {
        this.s3Key = s3Key;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BatchStatus getStatus() {
        return status;
    }

    public void setStatus(BatchStatus status) {
        this.status = status;
    }

    public ExitStatus getExitStatus() {
        return exitStatus;
    }

    public void setExitStatus(ExitStatus exitStatus) {
        this.exitStatus = exitStatus;
    }

    public Date getStartTime() {
        return startTime;
    }

    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }

    public Date getEndTime() {
        return endTime;
    }

    public void setEndTime(Date endTime) {
        this.endTime = endTime;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getCompleted() {
        return completed;
    }

    public void setCompleted(int completed) {
        this.completed = completed;
    }

    public int getSkipped() {
        return skipped;
    }

    public void setSkipped(int skipped) {
        this.skipped = skipped;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setNoOfLines(Long noOfLines) {
        this.noOfLines = noOfLines;
    }

    public Long getNoOfLines() {
        return noOfLines;
    }
}
