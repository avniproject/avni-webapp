package org.openchs.excel.metadata;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.joda.time.DateTime;
import org.junit.Before;
import org.junit.Test;
import org.openchs.domain.Program;
import org.openchs.domain.ProgramEnrolment;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Map;


public class NashornTest {

    private ScriptEngine engine;

    @Before
    public void setUp() throws Exception {
        engine = new ScriptEngineManager().getEngineByName("nashorn");
    }

    @Test
    public void name() throws ScriptException, IOException {
        engine.eval("var console = {log: function(x){}};");
        ScriptObjectMirror eval = (ScriptObjectMirror) engine.eval(
                new InputStreamReader(this.getClass().getResourceAsStream("/js/programEnrolmentDecision.js")));
        ProgramEnrolment programEnrolment = new ProgramEnrolment();
        programEnrolment.setUuid("8c9b3475-76bd-433c-a806-ed8fd20825f4");
        Program program = new Program();
        program.setName("Good Name");
        program.setUuid("52deb40b-03bc-46a0-a520-0e755f83723f");
        programEnrolment.setProgram(program);
        programEnrolment.setEnrolmentDateTime(new DateTime());
        Map filterTest = (Map) eval.callMember("test", programEnrolment);
        filterTest.forEach((k, v) -> {
            System.out.println("\n\n");
            System.out.println(k);
            System.out.println(v);
            System.out.println("\n\n");
        });
    }
}
