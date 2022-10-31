package org.avni.server.web.request.webapp.search;

import java.io.Serializable;

public class SearchResultConcepts implements Serializable {

    private String name;
    private String uuid;
    private long displayOrder;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public long getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(long displayOrder) {
        this.displayOrder = displayOrder;
    }
}
