package org.avni.server.web.request.rules.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class EligibilityRuleEntity {
    @JsonProperty("isEligible")
    private boolean isEligible;
    private String typeUUID;

    public String getTypeUUID() {
        return typeUUID;
    }

    public void setTypeUUID(String typeUUID) {
        this.typeUUID = typeUUID;
    }

    public boolean isEligible() {
        return isEligible;
    }

    public void setEligible(boolean eligible) {
        isEligible = eligible;
    }
}
