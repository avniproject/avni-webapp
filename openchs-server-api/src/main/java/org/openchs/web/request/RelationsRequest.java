package org.openchs.web.request;

import org.openchs.web.request.ReferenceDataContract;

public class RelationsRequest extends ReferenceDataContract {

    private String gender;

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }
}
