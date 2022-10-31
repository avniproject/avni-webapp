package org.avni.server.dao.application;

import org.avni.server.common.AbstractControllerIntegrationTest;
import org.avni.server.dao.application.FormElementRepository;
import org.joda.time.DateTime;
import org.junit.Before;
import org.junit.Test;
import org.avni.server.application.FormElement;
import org.avni.server.application.NonApplicableFormElement;
import org.avni.server.builder.NonApplicableFormElementBuilder;
import org.avni.server.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.jdbc.Sql;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@Sql(scripts = {"/test-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"/tear-down.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
public class FormElementRepositoryTest extends AbstractControllerIntegrationTest {
    @Autowired
    private FormElementRepository formElementRepository;

    private PageRequest pageRequest;

    @Override
    @Before
    public void setUp() throws Exception {
        super.setUp();
        pageRequest = new PageRequest(0, 100);
        setUser("demo-admin");
    }

    @Test
    public void fetchAllFormElementsGivenAllOfThemAreApplicable() {
        DateTime lastModifiedDateTime = new DateTime(1900, 1, 1, 0, 0);
        Page<FormElement> allFormElements = formElementRepository
                .findAll(pageRequest);
        Page<FormElement> allFormElementsWithNonApplicableFilteredOut = formElementRepository
                .findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(lastModifiedDateTime,
                        new DateTime(), pageRequest);
        assertEquals(allFormElements.getTotalElements(), allFormElementsWithNonApplicableFilteredOut.getTotalElements());
    }

    @Test
    public void fetchFormElementsOnlyApplicableForMyOrganisation() {
        DateTime lastModifiedDateTime = new DateTime(1900, 1, 1, 0, 0);

        Page<FormElement> allFormElements = formElementRepository
                .findAll(pageRequest);


        // Make form element non-applicable for current organisation
        FormElement formElement = allFormElements.getContent().get(0);
        NonApplicableFormElementBuilder nonApplicableFormElementBuilder = new NonApplicableFormElementBuilder(null);
        nonApplicableFormElementBuilder
                .withFormElement(formElement);
        nonApplicableFormElementBuilder.withOrganisation(UserContextHolder.getUserContext().getOrganisation());
        nonApplicableFormElementBuilder.withVoided(false);
        NonApplicableFormElement naElement = nonApplicableFormElementBuilder.build();
        formElement.setNonApplicable(naElement);
        formElementRepository.save(formElement);

        // Test non applicable form element to be voided
        Page<FormElement> allFormElementsWithNonApplicableFilteredOut = formElementRepository
                .findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(lastModifiedDateTime,
                        new DateTime(), pageRequest);
        assertEquals(allFormElements.getTotalElements(), allFormElementsWithNonApplicableFilteredOut.getTotalElements());
        FormElement voidedFormElement = allFormElementsWithNonApplicableFilteredOut.getContent().stream()
                .filter(fe -> fe.getUuid().equals(formElement.getUuid()))
                .findFirst()
                .get();
        assertTrue(voidedFormElement.isVoided());
    }
}
