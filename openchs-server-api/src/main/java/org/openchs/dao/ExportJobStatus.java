package org.openchs.dao;

import org.openchs.web.request.ExportJobRequest;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.ExitStatus;

import java.util.Date;

public class ExportJobStatus {

    private String uuid;
    private String fileName;
    private Long userId;
    private BatchStatus status;
    private ExitStatus exitStatus;
    private Date startTime;
    private Date endTime;
    private Date createTime;
    private ExportJobRequest request;

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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public ExportJobRequest getRequest() {
        return request;
    }

    public void setRequest(ExportJobRequest request) {
        this.request = request;
    }

}
