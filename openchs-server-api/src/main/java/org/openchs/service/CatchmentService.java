package org.openchs.service;

import org.openchs.dao.CatchmentRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Catchment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CatchmentService {
    private final CatchmentRepository catchmentRepository;
    private final UserService userService;

    @Autowired
    public CatchmentService(CatchmentRepository catchmentRepository, UserService userService) {
        this.catchmentRepository = catchmentRepository;
        this.userService = userService;
    }

    public Catchment createOrUpdate(String catchmentName, AddressLevel location) {
        Catchment catchment = catchmentRepository.findByNameIgnoreCase(catchmentName);
        if (catchment == null) {
            catchment = new Catchment();
        }
        catchment.assignUUIDIfRequired();
        catchment.setName(catchmentName);
        catchment.setType(location.getTypeString());
        catchment.addAddressLevel(location);
        catchment.setOrganisationId(userService.getCurrentUser().getOrganisationId());

        return catchmentRepository.save(catchment);
    }
}
