package org.openchs.healthmodule.adapter;

import org.joda.time.LocalDate;
import org.junit.Ignore;
import org.junit.Test;
import org.openchs.healthmodule.adapter.contract.ChecklistRuleResponse;
import org.openchs.healthmodule.adapter.contract.IndividualRuleInput;
import org.openchs.healthmodule.adapter.contract.ProgramEnrolmentRuleInput;
import org.openchs.healthmodule.adapter.contract.ProgramRuleInput;

import java.io.File;

import static org.junit.Assert.assertEquals;

public class HealthModuleInvokerFactoryTest {
    @Test @Ignore
    public void invoke() throws Exception {
        File file = new File("../external");

        HealthModuleInvokerFactory healthModuleInvokerFactory = new HealthModuleInvokerFactory(file);
        IndividualRuleInput individual = new IndividualRuleInput();
        individual.setDateOfBirth(new LocalDate(2017, 3, 1).toDate());
        ProgramEnrolmentRuleInput programEnrolmentRuleInput = new ProgramEnrolmentRuleInput(individual, new ProgramRuleInput("Child"));
        ProgramEnrolmentModuleInvoker programEnrolmentModuleInvoker = healthModuleInvokerFactory.getProgramEnrolmentInvoker();
        ChecklistRuleResponse checklist = programEnrolmentModuleInvoker.getChecklist(programEnrolmentRuleInput);
        assertEquals(25, checklist.getNumberOfItems());
    }
}