package org.openchs.healthmodule.adapter.contract;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

import java.util.Date;

public class RuleResponse {
    protected Date getDate(ScriptObjectMirror scriptObjectMirror, String name) {
        ScriptObjectMirror scriptObjectMirror1 = (ScriptObjectMirror) scriptObjectMirror.get(name);
        double timestampLocalTime = (Double) scriptObjectMirror1.callMember("getTime");
        return new Date((long)timestampLocalTime);
    }
}