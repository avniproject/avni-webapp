package org.avni.service;

import org.avni.application.projections.VirtualCatchmentProjection;
import org.avni.dao.AddressLevelTypeRepository;
import org.avni.dao.LocationRepository;
import org.avni.domain.AddressLevel;
import org.avni.domain.AddressLevelType;
import org.avni.domain.Catchment;
import org.avni.web.request.AddressLevelContract;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressLevelService {
    private final LocationRepository locationRepository;
    private final AddressLevelTypeRepository addressLevelTypeRepository;
    private ThreadLocal<AddressLevelsForCatchment> addressLevelCache = ThreadLocal.withInitial(AddressLevelsForCatchment::new);

    private class AddressLevelsForCatchment {
        private Long catchmentId;
        private List<Long> addressLevelIds;

        public List<Long> getAddressLevelsForCatchment(Catchment catchment) {
            if (catchment.getId() == catchmentId) return addressLevelIds;
            this.catchmentId = catchment.getId();
            this.addressLevelIds = locationRepository.getVirtualCatchmentsForCatchmentId(catchment.getId())
                    .stream()
                    .map(VirtualCatchmentProjection::getAddresslevel_id)
                    .collect(Collectors.toList());
            return addressLevelIds;
        }
    }

    public AddressLevelService(LocationRepository locationRepository,
                               AddressLevelTypeRepository addressLevelTypeRepository) {
        this.locationRepository = locationRepository;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
    }

    public List<AddressLevelContract> getAllLocations() {
        List<AddressLevel> locationList = locationRepository.getAllByIsVoidedFalse();
        return locationList.stream()
                .filter(al -> !al.getType().isVoided())
                .map(addressLevel -> {
                    AddressLevelContract addressLevelContract = new AddressLevelContract();
                    addressLevelContract.setId(addressLevel.getId());
                    addressLevelContract.setUuid(addressLevel.getUuid());
                    addressLevelContract.setName(addressLevel.getTitle());
                    addressLevelContract.setType(addressLevel.getType().getName());
                    return addressLevelContract;
                }).collect(Collectors.toList());
    }

    public List<String> getAllAddressLevelTypeNames() {
        return addressLevelTypeRepository.findAllByIsVoidedFalse()
                .stream()
                .sorted(Comparator.comparingDouble(AddressLevelType::getLevel))
                .map(AddressLevelType::getName)
                .collect(Collectors.toList());
    }

    public List<Long> getAllAddressLevelIdsForCatchment(Catchment catchment) {
        return addressLevelCache.get().getAddressLevelsForCatchment(catchment);
    }
}
