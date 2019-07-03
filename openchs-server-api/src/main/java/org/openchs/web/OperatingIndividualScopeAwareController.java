package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.OperatingIndividualScopeAwareRepository;
import org.openchs.domain.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specifications;

import java.util.Collections;

import static org.openchs.domain.OperatingIndividualScope.ByCatchment;
import static org.openchs.domain.OperatingIndividualScope.ByFacility;

public interface OperatingIndividualScopeAwareController<T extends CHSEntity> {

    default Page<T> getCHSEntitiesForUserByLastModifiedDateTime(User user, DateTime lastModifiedDateTime, DateTime now, Pageable pageable) {
        OperatingIndividualScope scope = user.getOperatingIndividualScope();
        Facility userFacility = user.getFacility();
        Catchment catchment = user.getCatchment();
        if(ByCatchment.equals(scope)) {
            return resourceRepository().findByCatchmentIndividualOperatingScope(catchment.getId(), lastModifiedDateTime, now, pageable);
        }
        if (ByFacility.equals(scope)) {
            return resourceRepository().findByFacilityIndividualOperatingScope(userFacility.getId(), lastModifiedDateTime, now, pageable);
        }
        return new PageImpl<>(Collections.emptyList());
    }

    default Page<T> findAllByUserAndSpec(User user, Specifications<T> specifications, Pageable pageable) {
        OperatingIndividualScope scope = user.getOperatingIndividualScope();
        Facility userFacility = user.getFacility();
        Catchment catchment = user.getCatchment();
        if(ByCatchment.equals(scope)) {
            return resourceRepository().findAll(specifications.and(resourceRepository().getFilterSpecForCatchment(catchment.getId())), pageable);
        }
        if (ByFacility.equals(scope)) {
            return resourceRepository().findAll(specifications.and(resourceRepository().getFilterSpecForFacility(userFacility.getId())), pageable);
        }
        return new PageImpl<>(Collections.emptyList());
    }

    OperatingIndividualScopeAwareRepository<T> resourceRepository();
}
