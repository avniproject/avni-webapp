package org.openchs.domain.metadata;

import org.openchs.domain.EncounterType;
import org.openchs.domain.Organisation;
import org.openchs.domain.Program;
import org.openchs.domain.SubjectType;

public interface MetaDataVisitor {
    void visit(SubjectType subjectType);
    void visit(SubjectType subjectType, Program program);
    void visit(SubjectType subjectType, Program program, EncounterType encounterType);
    void visit(SubjectType subjectType, EncounterType encounterType);
}
