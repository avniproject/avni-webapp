package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.OperatingIndividualScopeAwareRepositoryWithTypeFilter;
import org.openchs.domain.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;

import static org.openchs.domain.OperatingIndividualScope.ByCatchment;
import static org.openchs.domain.OperatingIndividualScope.ByFacility;

public interface OperatingIndividualScopeAwareFilterController<T extends CHSEntity> {

    default Page<T> getCHSEntitiesForUserByLastModifiedDateTimeAndFilterByType(User user, DateTime lastModifiedDateTime, DateTime now, List<String> filters, Pageable pageable) {
        OperatingIndividualScope scope = user.getOperatingIndividualScope();
        Facility userFacility = user.getFacility();
        Catchment catchment = user.getCatchment();
        if (ByCatchment.equals(scope)) {
            return repository().findByCatchmentIndividualOperatingScopeAndFilterByType(catchment.getId(), lastModifiedDateTime, now, filters, pageable);
        }
        if (ByFacility.equals(scope)) {
            return repository().findByFacilityIndividualOperatingScopeAndFilterByType(userFacility.getId(), lastModifiedDateTime, now, filters, pageable);
        }
        return new PageImpl<>(Collections.emptyList());
    }

    OperatingIndividualScopeAwareRepositoryWithTypeFilter<T> repository();
}
