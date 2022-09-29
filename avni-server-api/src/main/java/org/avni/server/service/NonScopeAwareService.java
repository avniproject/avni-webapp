package org.avni.server.service;

import org.joda.time.DateTime;

public interface NonScopeAwareService {

    boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime);

}
