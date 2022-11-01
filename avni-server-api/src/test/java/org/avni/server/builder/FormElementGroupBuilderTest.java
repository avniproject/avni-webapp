package org.avni.server.builder;

import org.avni.server.application.Form;
import org.avni.server.application.FormElement;
import org.avni.server.application.FormElementGroup;
import org.avni.server.domain.Concept;
import org.avni.server.domain.factory.metadata.ConceptBuilder;
import org.avni.server.domain.factory.metadata.FormElementBuilder;
import org.avni.server.service.ConceptService;
import org.avni.server.service.DocumentationService;
import org.avni.server.web.request.ConceptContract;
import org.avni.server.web.request.application.FormElementContract;
import org.avni.server.web.request.application.FormElementGroupContract;
import org.junit.Test;

import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertTrue;
import static org.mockito.Mockito.mock;

public class FormElementGroupBuilderTest {
    @Test
    public void voidedFormElementGroupShouldVoidAllFormElements() throws FormBuilderException {
        ConceptService conceptService = mock(ConceptService.class);
        DocumentationService documentationService = mock(DocumentationService.class);

        FormElementGroupContract formElementGroupContract = new FormElementGroupContract();
        FormElementContract formElementContract = new FormElementContract();
        formElementContract.setUuid("fe-uuid-1");
        ConceptContract conceptContract = new ConceptContract();
        conceptContract.setUuid("c-uuid-1");
        formElementContract.setConcept(conceptContract);
        formElementGroupContract.addFormElement(formElementContract);
        formElementContract.setVoided(true);


        Concept concept = new ConceptBuilder().withUuid("c-uuid-1").build();
        FormElement existingFormElement = new FormElementBuilder().withUuid("fe-uuid-1").withConcept(concept).build();
        FormElementGroup existingFormElementGroup = new FormElementGroup();
        existingFormElementGroup.addFormElement(existingFormElement);
        FormElementGroupBuilder formElementGroupBuilder = new FormElementGroupBuilder(new Form(), existingFormElementGroup, new FormElementGroup(), conceptService, documentationService);
        FormElementGroup updatedFormElementGroup = formElementGroupBuilder.makeFormElements(formElementGroupContract).build();

        updatedFormElementGroup.getFormElements().forEach(formElement -> {
            assertTrue(formElement.isVoided());
            assertFalse(formElement.getConcept().isVoided());
        });
    }
}
