package org.avni.server.web.request.task;

import java.util.List;

public class TaskAssignmentRequest {
    private List<Long> taskIds;
    private List<Long> assignToUserIds;
    private Long statusId;
    private boolean isAllSelected;
    private TaskFilterCriteria taskFilterCriteria;

    public List<Long> getTaskIds() {
        return taskIds;
    }

    public void setTaskIds(List<Long> taskIds) {
        this.taskIds = taskIds;
    }

    public List<Long> getAssignToUserIds() {
        return assignToUserIds;
    }

    public Long[] getAssignedToUserIdArray() {
        return assignToUserIds.toArray(new Long[0]);
    }

    public void setAssignToUserIds(List<Long> assignToUserIds) {
        this.assignToUserIds = assignToUserIds;
    }

    public Long getStatusId() {
        return statusId;
    }

    public void setStatusId(Long statusId) {
        this.statusId = statusId;
    }

    public boolean isAllSelected() {
        return isAllSelected;
    }

    public void setAllSelected(boolean allSelected) {
        isAllSelected = allSelected;
    }

    public TaskFilterCriteria getTaskFilterCriteria() {
        return taskFilterCriteria;
    }

    public void setTaskFilterCriteria(TaskFilterCriteria taskFilterCriteria) {
        this.taskFilterCriteria = taskFilterCriteria;
    }
}
