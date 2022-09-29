package org.avni.domain.metadata;

import org.avni.server.domain.metadata.SubjectTypes;
import org.junit.Test;
import org.avni.server.domain.EncounterType;
import org.avni.server.domain.Program;
import org.avni.server.domain.SubjectType;

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
        program.setUuid("2c0591cd-f830-488f-a95a-7f6825f87399");

        EncounterType e1 = new EncounterType();
        e1.setName("E1");
        subjectTypes.addEncounterType(subjectType, program, e1);

        EncounterType e2 = new EncounterType();
        e2.setName("E2");
        subjectTypes.addEncounterType(subjectType, program, e2);

        Map<SubjectType, Map<Program, List<EncounterType>>> programEncounterTypes = subjectTypes.getProgramEncounterTypes();
        assertEquals(1, programEncounterTypes.size());
        Map<Program, List<EncounterType>> programListMap = programEncounterTypes.get(subjectType);
        assertEquals(1, programListMap.size());
        List<EncounterType> encounterTypes = programListMap.get(program);
        assertEquals(2, encounterTypes.size());

        Program p2 = new Program();
        p2.setName("P2");
        p2.setUuid("146ffd62-d035-4a5b-ba68-a45302b3e523");
        EncounterType e3 = new EncounterType();
        e3.setName("E3");
        subjectTypes.addEncounterType(subjectType, p2, e3);

        Map<SubjectType, Map<Program, List<EncounterType>>> pet = subjectTypes.getProgramEncounterTypes();
        assertEquals(1, pet.size());
        assertEquals(2, pet.get(subjectType).size());
        assertEquals(1, pet.get(subjectType).get(p2).size());
    }
}
