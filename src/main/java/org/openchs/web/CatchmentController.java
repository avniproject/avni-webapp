package org.openchs.web;

import org.openchs.dao.AddressLevelRepository;
import org.openchs.dao.CatchmentRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Catchment;
import org.openchs.web.request.CatchmentContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.HashSet;
import java.util.List;

@RestController
public class CatchmentController {

    private CatchmentRepository catchmentRepository;
    private AddressLevelRepository addressLevelRepository;

    @Autowired
    public CatchmentController(CatchmentRepository catchmentRepository, AddressLevelRepository addressLevelRepository) {
        this.catchmentRepository = catchmentRepository;
        this.addressLevelRepository = addressLevelRepository;
    }

    @RequestMapping(value = "/catchments", method = RequestMethod.POST)
    @Transactional
    void save(@RequestBody List<CatchmentContract> catchmentRequests){
        catchmentRequests.forEach(catchmentRequest -> {
            System.out.println(String.format("Creating catchment: %s", catchmentRequest.toString()));

            if (conceptExistsWithSameNameAndDifferentUUID(catchmentRequest)) {
                throw new RuntimeException(String.format("Catchment %s exists with different uuid", catchmentRequest.getName()));
            }

            Catchment catchment = catchmentRepository.findByUuid(catchmentRequest.getUuid());
            if (catchment == null) {
                catchment = createCatchment(catchmentRequest);
            }
            catchment.setName(catchmentRequest.getName());

            if (catchment.getAddressLevels() == null) catchment.setAddressLevels(new HashSet<>());
            for (short order = 1; order < catchmentRequest.getVillages().size(); order++) {
                String village = catchmentRequest.getVillages().get(order - 1);
                AddressLevel addressLevel = catchment.findAddressLevel(village);
                if (addressLevel == null) {
                    System.out.println(String.format("Creating addressLevel: %s", village));
                    addressLevel = new AddressLevel();
                    addressLevel.assignUUID();
                    addressLevel.setTitle(village);
                    addressLevel.setLevel(1);
                    addressLevelRepository.save(addressLevel);
                }
                catchment.addAddressLevel(addressLevel);
            }
            catchmentRepository.save(catchment);


        });
    }

    private Catchment createCatchment(CatchmentContract catchmentContract) {
        Catchment catchment = new Catchment();
        catchment.setUuid(catchmentContract.getUuid());
        return catchment;
    }

    private boolean conceptExistsWithSameNameAndDifferentUUID(CatchmentContract catchmentRequest) {
        Catchment catchment = catchmentRepository.findByName(catchmentRequest.getName());
        return catchment != null && !catchment.getUuid().equals(catchmentRequest.getUuid());
    }

}
