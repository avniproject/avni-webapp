package org.avni.server.adapter.contract.validation;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.avni.server.adapter.contract.RuleResponse;

public class RuleValidationResult extends RuleResponse {
    private final String success;
    private final String messageKey;

    public RuleValidationResult(ScriptObjectMirror scriptObjectMirror) {
        super(scriptObjectMirror);
        this.success = this.getString("success");
        this.messageKey = this.getString("messageKey");
    }

    @Override
    public String toString() {
        return "{" +
                "success='" + success + '\'' +
                ", messageKey='" + messageKey + '\'' +
                '}';
    }
}
