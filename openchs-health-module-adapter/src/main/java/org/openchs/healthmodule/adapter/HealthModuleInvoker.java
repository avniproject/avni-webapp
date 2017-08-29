package org.openchs.healthmodule.adapter;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;

public class HealthModuleInvoker {
    private static ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
    private ScriptObjectMirror eval;

    public void loadModule(File file) throws FileNotFoundException, ScriptException {
        if (file.exists()) {
            eval = (ScriptObjectMirror) engine.eval(new FileReader(file));
        }
    }

    public Object invoke(String functionName, Object... args) {
        try {
            return eval.callMember(functionName, args);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}