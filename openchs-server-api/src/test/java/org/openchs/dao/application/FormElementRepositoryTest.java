package org.openchs.dao.application;

import org.joda.time.DateTime;
import org.junit.Before;
import org.junit.Test;
import org.openchs.application.FormElement;
import org.openchs.application.NonApplicableFormElement;
import org.openchs.builder.NonApplicableFormElementBuilder;
import org.openchs.common.AbstractControllerIntegrationTest;
import org.openchs.dao.OrganisationRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.Organisation;
import org.openchs.domain.User;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
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

    @Autowired
    private OrganisationRepository organisationRepository;

    @Autowired
    private UserRepository userRepository;

    private PageRequest pageRequest;

    @Override
    @Before
    public void setUp() throws Exception {
        super.setUp();
        pageRequest = new PageRequest(0, 100);
        UserContext userContext = new UserContext();
        User admin = userRepository.findByName("admin");
        userContext.setOrganisation(organisationRepository.findByUuid("3539a906-dfae-4ec3-8fbb-1b08f35c3884"));
        userContext.setUser(admin);
        UserContextHolder.create(userContext);
    }

    @Test
    public void fetchAllFormElementsGivenAllOfThemAreApplicable() {
        DateTime lastModifiedDateTime = new DateTime(1900, 1, 1, 0, 0);
        Page<FormElement> allFormElements = formElementRepository
                .findAll(pageRequest);
        Page<FormElement> allFormElementsWithNonApplicableFilteredOut = formElementRepository
                .findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(lastModifiedDateTime,
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
                .findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(lastModifiedDateTime,
                        new DateTime(), pageRequest);
        assertEquals(allFormElements.getTotalElements(), allFormElementsWithNonApplicableFilteredOut.getTotalElements());
        FormElement voidedFormElement = allFormElementsWithNonApplicableFilteredOut.getContent().stream()
                .filter(fe -> fe.getUuid().equals(formElement.getUuid()))
                .findFirst()
                .get();
        assertTrue(voidedFormElement.isVoided());
    }
}