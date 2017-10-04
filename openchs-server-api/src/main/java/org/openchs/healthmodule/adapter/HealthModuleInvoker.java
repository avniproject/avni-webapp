package org.openchs.healthmodule.adapter;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

import javax.script.ScriptEngine;
import java.io.InputStream;
import java.io.InputStreamReader;

public abstract class HealthModuleInvoker {
    protected ScriptObjectMirror eval;

    public HealthModuleInvoker(ScriptEngine scriptEngine, InputStream inputStream) {
        try {
            scriptEngine.eval("var console = {log: function(x){}};");
            eval = (ScriptObjectMirror) scriptEngine.eval(new InputStreamReader(inputStream));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    protected Object invoke(String functionName, Object... args) {
        try {
            return eval.callMember(functionName, args);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}