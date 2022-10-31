package org.avni.server.domain;

import org.joda.time.DateTime;

import org.joda.time.DateTime;

public class Extension {
    private String url;
    private DateTime lastModifiedDateTime;

    public Extension(String url, DateTime lastModifiedDateTime) {
        this.url = url;
        this.lastModifiedDateTime = lastModifiedDateTime;
    }

    public String getUrl() {
        return url;
    }

    public DateTime getLastModifiedDateTime() {
        return lastModifiedDateTime;
    }
}
