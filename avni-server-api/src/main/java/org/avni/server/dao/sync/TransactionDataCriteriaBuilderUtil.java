package org.avni.server.dao.sync;

import javax.persistence.criteria.From;
import javax.persistence.criteria.Join;

public class TransactionDataCriteriaBuilderUtil {
    public static Join<Object, Object> joinUserSubjectAssignment(From fromSubject) {
        return fromSubject.join("userSubjectAssignments");
    }

    public static Join<Object, Object> joinUserSubjectAssignmentViaSubject(From from) {
        return joinUserSubjectAssignment(from.join("individual"));
    }
}
