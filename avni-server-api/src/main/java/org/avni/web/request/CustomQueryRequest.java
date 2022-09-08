package org.avni.web.request;

import java.util.Map;

public class CustomQueryRequest {

    private String name;
    private Map<String, Object> queryParams;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Map<String, Object> getQueryParams() {
        return queryParams;
    }

    public void setQueryParams(Map<String, Object> queryParams) {
        this.queryParams = queryParams;
    }
}
