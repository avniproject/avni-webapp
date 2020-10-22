package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.OperatingIndividualScopeAwareRepositoryWithTypeFilter;
import org.openchs.domain.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Collections;

import static org.openchs.domain.OperatingIndividualScope.ByCatchment;
import static org.openchs.domain.OperatingIndividualScope.ByFacility;

public interface OperatingIndividualScopeAwareFilterController<T extends CHSEntity> {

    default Page<T> getCHSEntitiesForUserByLastModifiedDateTimeAndFilterByType(User user, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        OperatingIndividualScope scope = user.getOperatingIndividualScope();
        Facility userFacility = user.getFacility();
        Catchment catchment = user.getCatchment();
        if (ByCatchment.equals(scope)) {
            return repository().findByCatchmentIndividualOperatingScopeAndFilterByType(catchment.getId(), lastModifiedDateTime, now, filter, pageable);
        }
        if (ByFacility.equals(scope)) {
            return repository().findByFacilityIndividualOperatingScopeAndFilterByType(userFacility.getId(), lastModifiedDateTime, now, filter, pageable);
        }
        return new PageImpl<>(Collections.emptyList());
    }

    OperatingIndividualScopeAwareRepositoryWithTypeFilter<T> repository();
}
