package org.avni.server.web.request.webapp.search;

import org.springframework.data.domain.Pageable;

public class LocationSearchRequest {
    private String title;
    private Integer addressLevelTypeId;
    private Integer parentId;
    private Pageable pageable;

    public LocationSearchRequest(String title, Integer addressLevelTypeId, Integer parentId, Pageable pageable) {
        this.title = title;
        this.addressLevelTypeId = addressLevelTypeId;
        this.parentId = parentId;
        this.pageable = pageable;
    }

    public String getTitle() {
        return title;
    }

    public Integer getAddressLevelTypeId() {
        return addressLevelTypeId;
    }

    public Integer getParentId() {
        return parentId;
    }

    public Pageable getPageable() {
        return pageable;
    }
}

