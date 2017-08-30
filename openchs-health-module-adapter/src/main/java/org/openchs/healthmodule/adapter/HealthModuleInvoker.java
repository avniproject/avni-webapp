package org.openchs.healthmodule.adapter;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

import javax.script.ScriptEngine;
import java.io.File;
import java.io.FileReader;

public abstract class HealthModuleInvoker {
    protected ScriptObjectMirror eval;

    public HealthModuleInvoker(ScriptEngine scriptEngine, File file) {
        try {
            if (file.exists()) {
                eval = (ScriptObjectMirror) scriptEngine.eval(new FileReader(file));
            }
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