package org.openchs.healthmodule.adapter;

import org.joda.time.LocalDate;
import org.junit.Test;
import org.openchs.healthmodule.adapter.contract.ChecklistRuleResponse;
import org.openchs.healthmodule.adapter.contract.IndividualRuleInput;
import org.openchs.healthmodule.adapter.contract.ProgramEnrolmentRuleInput;
import org.openchs.healthmodule.adapter.contract.ProgramRuleInput;

import java.io.File;

import static org.junit.Assert.assertEquals;

public class HealthModuleInvokerTest {
    @Test
    public void invoke() throws Exception {
        File file = new File("../external/programEnrolmentDecision.js");
        if (!file.exists()) return; //WIP

        HealthModuleInvoker healthModuleInvoker = new HealthModuleInvoker();
        healthModuleInvoker.loadModule(file);
        IndividualRuleInput individual = new IndividualRuleInput();
        individual.setDateOfBirth(new LocalDate(2017, 3, 1).toDate());
        ProgramEnrolmentRuleInput programEnrolmentRuleInput = new ProgramEnrolmentRuleInput(individual, new ProgramRuleInput("Child"));
        ProgramEnrolmentModuleInvoker programEnrolmentModuleInvoker = new ProgramEnrolmentModuleInvoker(healthModuleInvoker);
        ChecklistRuleResponse checklist = programEnrolmentModuleInvoker.getChecklist(programEnrolmentRuleInput);
        assertEquals(25, checklist.getNumberOfItems());
    }
}