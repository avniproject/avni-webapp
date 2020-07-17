package org.openchs.service;

import org.apache.poi.ss.formula.functions.T;
import org.openchs.dao.LocationRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.web.request.AddressLevelContract;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressLevelService {
    private final LocationRepository locationRepository;
    public AddressLevelService(  LocationRepository locationRepository) {
        this.locationRepository=locationRepository;
    }
    public List<AddressLevelContract> getAllLocations(){
        List<AddressLevel> locationList=locationRepository.getAllByIsVoidedFalse();
        return locationList.stream().map(adderssLevel-> {

                    AddressLevelContract addressLevelContract   =    new AddressLevelContract();
                    addressLevelContract.setId(adderssLevel.getId());
                    addressLevelContract.setUuid(adderssLevel.getUuid());
                    addressLevelContract.setName(adderssLevel.getTitle());
                    addressLevelContract.setType(adderssLevel.getType().getName());
            return addressLevelContract;
                }).collect(Collectors.toList());
    }
}
