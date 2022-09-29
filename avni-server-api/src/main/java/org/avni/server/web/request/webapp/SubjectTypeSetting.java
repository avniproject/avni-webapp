package org.avni.server.web.request.webapp;

import java.io.Serializable;
import java.util.List;

public class SubjectTypeSetting implements Serializable {

    private String subjectTypeUUID;
    private List<String> locationTypeUUIDs;

    public String getSubjectTypeUUID() {
        return subjectTypeUUID;
    }

    public void setSubjectTypeUUID(String subjectTypeUUID) {
        this.subjectTypeUUID = subjectTypeUUID;
    }

    public List<String> getLocationTypeUUIDs() {
        return locationTypeUUIDs;
    }

    public void setLocationTypeUUIDs(List<String> locationTypeUUIDs) {
        this.locationTypeUUIDs = locationTypeUUIDs;
    }
}
