package org.openchs.healthmodule.adapter;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import java.io.File;

public class HealthModuleInvokerFactory {
    private static ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
    private final ProgramEnrolmentModuleInvoker programEnrolmentInvoker;

    public HealthModuleInvokerFactory(File moduleDirectory) {
        this.programEnrolmentInvoker = new ProgramEnrolmentModuleInvoker(engine, new File(moduleDirectory,"programEnrolmentDecision.js"));
    }

    public ProgramEnrolmentModuleInvoker getProgramEnrolmentInvoker() {
        return programEnrolmentInvoker;
    }
}