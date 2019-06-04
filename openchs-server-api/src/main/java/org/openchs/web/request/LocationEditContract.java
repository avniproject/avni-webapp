package org.openchs.web.request;

public class LocationEditContract extends ReferenceDataContract {
    private String title;

    public LocationEditContract() {}

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }
}
