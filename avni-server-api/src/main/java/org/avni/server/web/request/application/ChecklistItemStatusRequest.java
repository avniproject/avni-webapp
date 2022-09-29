package org.avni.server.web.request.application;

import org.avni.server.domain.ChecklistItemStatus;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ChecklistItemStatusRequest implements Serializable {
    private Object from;
    private Object to;
    private String color;
    private String state;
    private Double displayOrder;
    private Integer start;
    private Integer end;


    public static List<ChecklistItemStatusRequest> fromEntity(ChecklistItemStatus checklistItemStatus) {
        List<ChecklistItemStatusRequest> checklistItemStatusRequests = new ArrayList<>();
        checklistItemStatus.forEach(cs -> {
            ChecklistItemStatusRequest checklistItemStatusRequest = new ChecklistItemStatusRequest();
            Map<String, Object> dbState = (Map<String, Object>) cs;
            checklistItemStatusRequest.setColor((String) dbState.get("color"));
            checklistItemStatusRequest.setDisplayOrder((Double) dbState.get("displayOrder"));
            checklistItemStatusRequest.setEnd((Integer) dbState.get("end"));
            checklistItemStatusRequest.setFrom(dbState.get("from"));
            checklistItemStatusRequest.setStart((Integer) dbState.get("start"));
            checklistItemStatusRequest.setState((String) dbState.get("state"));
            checklistItemStatusRequest.setTo(dbState.get("to"));
            checklistItemStatusRequests.add(checklistItemStatusRequest);
        });
        return checklistItemStatusRequests;
    }

    public Object getFrom() {
        return from;
    }

    public void setFrom(Object from) {
        this.from = from;
    }

    public Object getTo() {
        return to;
    }

    public void setTo(Object to) {
        this.to = to;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Double getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Double displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Integer getStart() {
        return start;
    }

    public void setStart(Integer start) {
        this.start = start;
    }

    public Integer getEnd() {
        return end;
    }

    public void setEnd(Integer end) {
        this.end = end;
    }
}
