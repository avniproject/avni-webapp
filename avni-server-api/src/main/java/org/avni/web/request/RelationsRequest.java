package org.avni.web.request;

import org.avni.web.request.ReferenceDataContract;

public class RelationsRequest extends ReferenceDataContract {

    private String gender;

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }
}
