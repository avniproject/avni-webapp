package org.openchs.domain.metadata;

import org.junit.Test;
import org.openchs.domain.EncounterType;
import org.openchs.domain.Program;
import org.openchs.domain.SubjectType;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;

public class SubjectTypesTest {
    @Test
    public void addEncounterType() {
        SubjectType subjectType = new SubjectType();
        subjectType.setName("S1");
        SubjectTypes subjectTypes = new SubjectTypes(Collections.singletonList(subjectType));

        Program program = new Program();
        program.setName("P1");

        EncounterType e1 = new EncounterType();
        e1.setName("E1");
        subjectTypes.addEncounterType(subjectType, program, e1);

        EncounterType e2 = new EncounterType();
        e1.setName("E2");
        subjectTypes.addEncounterType(subjectType, program, e2);

        Map<SubjectType, Map<Program, List<EncounterType>>> programEncounterTypes = subjectTypes.getProgramEncounterTypes();
        assertEquals(1, programEncounterTypes.size());
        Map<Program, List<EncounterType>> programListMap = programEncounterTypes.get(subjectType);
        assertEquals(1, programListMap.size());
        List<EncounterType> encounterTypes = programListMap.get(program);
        assertEquals(2, encounterTypes.size());
    }
}