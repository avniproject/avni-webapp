package org.avni.server.service;

public class UserCreateStatus {
    private boolean idpUserCreated;
    private boolean defaultPasswordPermanent;
    private boolean nonDefaultPasswordSet;

    public void setIdpUserCreated(boolean idpUserCreated) {
        this.idpUserCreated = idpUserCreated;
    }

    public boolean getIdpUserCreated() {
        return idpUserCreated;
    }

    public void setDefaultPasswordPermanent(boolean defaultPasswordPermanent) {
        this.defaultPasswordPermanent = defaultPasswordPermanent;
    }

    public boolean getDefaultPasswordPermanent() {
        return defaultPasswordPermanent;
    }

    public boolean isNonDefaultPasswordSet() {
        return nonDefaultPasswordSet;
    }

    public void setNonDefaultPasswordSet(boolean nonDefaultPasswordSet) {
        this.nonDefaultPasswordSet = nonDefaultPasswordSet;
    }
}
