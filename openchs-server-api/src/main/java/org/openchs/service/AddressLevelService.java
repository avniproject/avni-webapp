package org.openchs.service;

import org.openchs.dao.AddressLevelTypeRepository;
import org.openchs.dao.LocationRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.AddressLevelType;
import org.openchs.web.request.AddressLevelContract;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressLevelService {
    private final LocationRepository locationRepository;
    private final AddressLevelTypeRepository addressLevelTypeRepository;

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
}
