package org.avni.server.web.api;

import org.avni.server.domain.Individual;

public class ApiErrorUtil {
    public static void throwIfSubjectNotFound(Individual individual, String uuid, String legacyId) {
        if (individual == null) {
            throw new IllegalArgumentException(String.format("Individual not found with UUID '%s' or External ID '%s'",
                    uuid, legacyId));
        }
    }
}
