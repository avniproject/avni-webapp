package org.avni.server.domain.metadata;

import org.avni.server.domain.EncounterType;
import org.avni.server.domain.Program;
import org.avni.server.domain.SubjectType;

public interface MetaDataVisitor {
    void visit(SubjectType subjectType);
    void visit(SubjectType subjectType, Program program);
    void visit(SubjectType subjectType, Program program, EncounterType encounterType);
    void visit(SubjectType subjectType, EncounterType encounterType);
}
