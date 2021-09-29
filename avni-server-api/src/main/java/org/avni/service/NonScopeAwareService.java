package org.avni.service;

import org.joda.time.DateTime;

public interface NonScopeAwareService {

    boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime);

}
