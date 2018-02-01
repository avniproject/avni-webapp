package org.openchs.util;

import org.openchs.framework.security.UserContextHolder;

public class LockProvider {
    public static String getLockObject(Object source) {
        String organisationName = UserContextHolder.getUserContext().getOrganisation().getName();
        return String.format("${organisationName}-${resourceName}", organisationName, source.getClass().getName()).intern();
    }
}
