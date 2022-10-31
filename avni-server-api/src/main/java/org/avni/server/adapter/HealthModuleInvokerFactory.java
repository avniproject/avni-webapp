package org.avni.server.adapter;

import org.springframework.context.annotation.Lazy;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import java.io.IOException;
import java.io.InputStream;

@Component
@Lazy
public class HealthModuleInvokerFactory {
    private final ProgramEnrolmentModuleInvoker programEnrolmentInvoker;
    private final ProgramEncounterRuleInvoker programEncounterInvoker;

    private InputStream getInputStreamForRule(String fileName) throws IOException {
        return new ClassPathResource("rules/" + fileName).getInputStream();
    }

    public HealthModuleInvokerFactory() throws IOException {
        ScriptEngine programEnrolmentEngine = new ScriptEngineManager().getEngineByName("nashorn");
        ScriptEngine programEncounterEngine = new ScriptEngineManager().getEngineByName("nashorn");
        this.programEnrolmentInvoker = new ProgramEnrolmentModuleInvoker(programEnrolmentEngine, getInputStreamForRule("programEnrolmentDecision.js"));
        this.programEncounterInvoker = new ProgramEncounterRuleInvoker(programEncounterEngine, getInputStreamForRule("programEncounterDecision.js"));
    }

    public ProgramEnrolmentModuleInvoker getProgramEnrolmentInvoker() {
        return programEnrolmentInvoker;
    }

    public ProgramEncounterRuleInvoker getProgramEncounterInvoker() {
        return programEncounterInvoker;
    }
}
