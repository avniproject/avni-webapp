package org.avni.server.web.request.application;

import org.avni.server.web.request.application.FormElementContract;
import org.junit.Before;
import org.junit.Test;
import org.avni.server.application.KeyValues;
import org.avni.server.domain.ConceptDataType;
import org.avni.server.web.request.ConceptContract;

import static org.junit.Assert.assertEquals;


public class FormElementContractValidationTest {
    private FormElementContract formElementContract;
    private KeyValues keyValues;

    @Before
    public void beforeTest() {
        formElementContract = new FormElementContract();
        formElementContract.setName("foo");
        ConceptContract concept = new ConceptContract();
        concept.setUuid("someUuid");
        formElementContract.setConcept(concept);
        formElementContract.getConcept().setDataType(ConceptDataType.Coded.toString());
        keyValues = new KeyValues();
        formElementContract.setKeyValues(keyValues);
    }

    @Test
    public void validate_form_element_contract_with_type_not_specified() {
        assertEquals(true, formElementContract.validate().isFailure());
    }

    @Test
    public void validate_form_element_cannot_contain_concept_when_conceptUUID_present() {
        ConceptContract concept = new ConceptContract();
        concept.setUnit("someConceptUUID");
        formElementContract.setConcept(concept);
        assertEquals(true, formElementContract.validate().isFailure());
    }

    @Test
    public void validate_form_element_cannot_contain_empty_concept_and_conceptUUID() {
        ConceptContract concept = new ConceptContract();
        concept.setUnit("someConceptUUID");
        formElementContract.setConcept(concept);
        formElementContract.setConcept(null);
        assertEquals(true, formElementContract.validate().isFailure());
    }

    @Test
    public void validate_form_element_contract_with_type_specified() {
        formElementContract.setType("SingleSelect");
        assertEquals(false, formElementContract.validate().isFailure());
    }

}
