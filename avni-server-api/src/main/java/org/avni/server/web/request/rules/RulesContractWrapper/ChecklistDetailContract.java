package org.avni.server.web.request.rules.RulesContractWrapper;

import org.avni.server.web.request.CHSRequest;

public class ChecklistDetailContract implements RuleServerEntityContract {

    private CHSRequest detail;

    public CHSRequest getDetail() {
        return detail;
    }

    public void setDetail(CHSRequest detail) {
        this.detail = detail;
    }
}
