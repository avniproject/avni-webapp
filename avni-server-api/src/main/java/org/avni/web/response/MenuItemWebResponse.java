package org.avni.web.response;

import org.avni.domain.CHSEntity;
import org.avni.web.request.application.menu.MenuItemContract;
import org.joda.time.DateTime;

public class MenuItemWebResponse extends MenuItemContract {
    private String createdBy;
    private String lastModifiedBy;
    private DateTime createdDateTime;
    private DateTime lastModifiedDateTime;

    public MenuItemWebResponse() {
    }

    public MenuItemWebResponse(CHSEntity entity) {
        super(entity);
        this.setCreatedBy(entity.getCreatedBy().getName());
        this.setLastModifiedBy(entity.getLastModifiedBy().getName());
        this.setCreatedDateTime(entity.getCreatedDateTime());
        this.setLastModifiedDateTime(entity.getLastModifiedDateTime());
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public DateTime getCreatedDateTime() {
        return createdDateTime;
    }

    public void setCreatedDateTime(DateTime createdDateTime) {
        this.createdDateTime = createdDateTime;
    }

    public DateTime getLastModifiedDateTime() {
        return lastModifiedDateTime;
    }

    public void setLastModifiedDateTime(DateTime lastModifiedDateTime) {
        this.lastModifiedDateTime = lastModifiedDateTime;
    }
}
