package org.openchs.healthmodule.adapter;

import org.joda.time.LocalDate;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.openchs.healthmodule.adapter.contract.ChecklistRuleResponse;
import org.openchs.healthmodule.adapter.contract.IndividualRuleInput;
import org.openchs.healthmodule.adapter.contract.ProgramEnrolmentRuleInput;
import org.openchs.healthmodule.adapter.contract.ProgramRuleInput;

import javax.script.ScriptException;
import java.io.File;

import static org.junit.Assert.assertEquals;

public class HealthModuleInvokerFactoryTest {
    private static File directory;

    @BeforeClass
    public static void beforeClass() {
        directory = new File("../external");
    }

    @Test @Ignore
    public void invoke() throws Exception {
        HealthModuleInvokerFactory healthModuleInvokerFactory = new HealthModuleInvokerFactory(directory);
        IndividualRuleInput individual = new IndividualRuleInput(new LocalDate(2017, 3, 1).toDate());
        ProgramEnrolmentRuleInput programEnrolmentRuleInput = new ProgramEnrolmentRuleInput(individual, new ProgramRuleInput("Child"));
        ProgramEnrolmentModuleInvoker programEnrolmentModuleInvoker = healthModuleInvokerFactory.getProgramEnrolmentInvoker();
        ChecklistRuleResponse checklist = programEnrolmentModuleInvoker.getChecklist(programEnrolmentRuleInput);
        assertEquals(25, checklist.getItems().size());
    }

    @Test @Ignore
    public void general() throws ScriptException {
        HealthModuleInvokerFactory healthModuleInvokerFactory = new HealthModuleInvokerFactory(directory);
        Object o = healthModuleInvokerFactory.evalAndReturn("new Date();");
    }
}