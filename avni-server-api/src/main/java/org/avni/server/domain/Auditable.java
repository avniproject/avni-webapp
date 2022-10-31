package org.avni.server.domain;

import org.joda.time.DateTime;

public interface Auditable {
    User getCreatedBy();
    void setCreatedBy(User lastModifiedBy);
    User getLastModifiedBy();
    void setLastModifiedBy(User lastModifiedBy);
    DateTime getCreatedDateTime();
    void setCreatedDateTime(DateTime createdDateTime);
    DateTime getLastModifiedDateTime();
    void setLastModifiedDateTime(DateTime createdDateTime);
}
