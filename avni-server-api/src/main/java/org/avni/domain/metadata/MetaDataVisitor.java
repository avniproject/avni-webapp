package org.avni.domain.metadata;

import org.avni.domain.EncounterType;
import org.avni.domain.Organisation;
import org.avni.domain.Program;
import org.avni.domain.SubjectType;

public interface MetaDataVisitor {
    void visit(SubjectType subjectType);
    void visit(SubjectType subjectType, Program program);
    void visit(SubjectType subjectType, Program program, EncounterType encounterType);
    void visit(SubjectType subjectType, EncounterType encounterType);
}
