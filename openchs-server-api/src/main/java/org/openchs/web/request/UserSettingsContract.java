package org.openchs.web.request;

public class UserSettingsContract extends CHSRequest {
    private boolean trackLocation;
    private String locale;

    public boolean getTrackLocation() {
        return trackLocation;
    }

    public void setTrackLocation(boolean trackLocation) {
        this.trackLocation = trackLocation;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }
}
