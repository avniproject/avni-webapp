package org.openchs.healthmodule.adapter;

import org.springframework.core.io.ClassPathResource;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.IOException;
import java.io.InputStream;

public class HealthModuleInvokerFactory {
    private static ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
    private final ProgramEnrolmentModuleInvoker programEnrolmentInvoker;

    private InputStream getInputStreamForRule(String fileName) throws IOException {
        return new ClassPathResource("rules/" + fileName).getInputStream();
    }

    public HealthModuleInvokerFactory() throws IOException {
        this.programEnrolmentInvoker = new ProgramEnrolmentModuleInvoker(engine, getInputStreamForRule("programEnrolmentDecision.js"));
    }

    public ProgramEnrolmentModuleInvoker getProgramEnrolmentInvoker() {
        return programEnrolmentInvoker;
    }

    public Object evalAndReturn(String script) throws ScriptException {
        return engine.eval(script);
    }
}