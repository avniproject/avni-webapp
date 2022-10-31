package org.avni.exporter.v2;

import org.avni.application.FormElement;
import org.avni.application.Subject;
import org.avni.domain.Concept;
import org.avni.domain.ConceptDataType;
import org.avni.domain.SubjectType;
import org.avni.server.exporter.v2.HeaderCreator;
import org.junit.Test;

import java.util.*;

import static org.junit.Assert.assertEquals;

public class HeaderCreatorTest {

    @Test
    public void shouldAddOnlyPassedRegistrationHeaders() {
        SubjectType subjectType = getSubjectType("Individual", Subject.Person);

        HeaderCreator headerCreator = new HeaderCreator();
        List<String> fieldsToAdd = new ArrayList<>();
        fieldsToAdd.addAll(Arrays.asList("id", "uuid", "firstName", "createdBy", "createdDateTime", "lastModifiedBy", "lastModifiedDateTime"));
        List<String> addressLevelTypes = Arrays.asList("Village");
        Map<String, FormElement> registrationMap = getStringFormElementMap();
        StringBuilder registrationHeaders = headerCreator.addRegistrationHeaders(subjectType, registrationMap, addressLevelTypes, fieldsToAdd);
        assertEquals(registrationHeaders.toString(), "Individual_id,Individual_uuid,Individual_first_name,Individual_created_by,Individual_created_date_time,Individual_last_modified_by,Individual_last_modified_date_time,\"Village\",\"Individual_Question 1\"");
    }

    @Test
    public void shouldAddAllStaticHeadersIfNoFieldsIsPassed() {
        SubjectType subjectType = getSubjectType("ABC", Subject.Person);
        List<String> addressLevelTypes = Arrays.asList("Village");
        HeaderCreator headerCreator = new HeaderCreator();
        StringBuilder registrationHeaders = headerCreator.addRegistrationHeaders(subjectType, new HashMap<>(), addressLevelTypes, new ArrayList<>());
        assertEquals(registrationHeaders.toString(), "ABC_id,ABC_uuid,ABC_first_name,ABC_middle_name,ABC_last_name,ABC_date_of_birth,ABC_registration_date,ABC_gender,ABC_created_by,ABC_created_date_time,ABC_last_modified_by,ABC_last_modified_date_time,ABC_voided,\"Village\"");
    }

    @Test
    public void shouldGenerateMultipleColumnsForEncounter() {
        HeaderCreator headerCreator = new HeaderCreator();
        List<String> fields = new ArrayList<>();
        fields.addAll(Arrays.asList("id", "createdBy", "createdDateTime", "lastModifiedBy", "lastModifiedDateTime"));
        StringBuilder stringBuilder = headerCreator.addEncounterHeaders(2L, getStringFormElementMap(), getStringFormElementMap(), "ENC", fields);
        assertEquals(stringBuilder.toString(), "ENC_1_id,ENC_1_created_by,ENC_1_created_date_time,ENC_1_last_modified_by,ENC_1_last_modified_date_time,\"ENC_1_Question 1\",\"ENC_1_Question 1\",ENC_2_id,ENC_2_created_by,ENC_2_created_date_time,ENC_2_last_modified_by,ENC_2_last_modified_date_time,\"ENC_2_Question 1\",\"ENC_2_Question 1\"");
    }

    private SubjectType getSubjectType(String name, Subject type) {
        SubjectType subjectType = new SubjectType();
        subjectType.setName(name);
        subjectType.setUuid("1890a382-8f47-4d2c-9126-40cb38a22e1f");
        subjectType.setId(200L);
        subjectType.setType(type);
        return subjectType;
    }

    private Map<String, FormElement> getStringFormElementMap() {
        Map<String, FormElement> map = new HashMap<>();
        Concept concept = new Concept();
        FormElement formElement = new FormElement();
        formElement.setType("SingleSelect");
        formElement.setConcept(concept);
        concept.setDataType(ConceptDataType.Text.toString());
        concept.setName("Question 1");
        map.put("Question 1 uuid", formElement);
        return map;
    }
}
