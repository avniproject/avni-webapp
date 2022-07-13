package org.avni.dao.sync;

import javax.persistence.criteria.From;
import javax.persistence.criteria.Join;

public class TransactionDataCriteriaBuilderUtil {
    public static Join<Object, Object> joinAssignedUser(From fromSubject) {
        return fromSubject.join("assignedUser");
    }

    public static Join<Object, Object> joinAssignedUserViaSubject(From from) {
        return joinAssignedUser(from.join("individual"));
    }

    public static Join<Object, Object> joinAssignedUserViaEnrolment(From from) {
        return joinAssignedUserViaSubject(from.join("programEnrolment"));
    }
}
