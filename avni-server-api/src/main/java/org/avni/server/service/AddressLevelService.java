package org.avni.server.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.avni.server.application.KeyType;
import org.avni.server.application.projections.VirtualCatchmentProjection;
import org.avni.server.dao.AddressLevelTypeRepository;
import org.avni.server.dao.LocationRepository;
import org.avni.server.domain.*;
import org.avni.server.util.ObjectMapperSingleton;
import org.avni.server.web.request.AddressLevelContract;
import org.avni.server.web.request.webapp.SubjectTypeSetting;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AddressLevelService {
    private final LocationRepository locationRepository;
    private final AddressLevelTypeRepository addressLevelTypeRepository;
    private final OrganisationConfigService organisationConfigService;
    private ObjectMapper objectMapper;
    private ThreadLocal<AddressLevelsForCatchment> addressLevelCache = ThreadLocal.withInitial(AddressLevelsForCatchment::new);

    private class AddressLevelsForCatchment {
        private Long catchmentId;
        private List<Long> addressLevelIds;

        public List<Long> getAddressLevelsByCatchmentAndSubjectType(Catchment catchment, SubjectType subjectType) {
            if (catchment.getId() == catchmentId) return addressLevelIds;
            this.catchmentId = catchment.getId();
            this.addressLevelIds = getAddressLevels(catchment, subjectType)
                    .stream()
                    .map(VirtualCatchmentProjection::getAddresslevel_id)
                    .collect(Collectors.toList());
            return addressLevelIds;
        }

        private List<VirtualCatchmentProjection> getAddressLevels(Catchment catchment, SubjectType subjectType) {
            List<SubjectTypeSetting> customRegistrationLocations = objectMapper.convertValue(organisationConfigService.getSettingsByKey(KeyType.customRegistrationLocations.toString()), new TypeReference<List<SubjectTypeSetting>>() {});
            Optional<SubjectTypeSetting> customLocationTypes = customRegistrationLocations.stream()
                    .filter(crl -> crl.getSubjectTypeUUID()
                            .equals(subjectType.getUuid()))
                    .findFirst();
            if (customLocationTypes.isPresent() && !customLocationTypes.get().getLocationTypeUUIDs().isEmpty()) {
                List<Long> locationTypeIds = addressLevelTypeRepository.findAllByUuidIn(customLocationTypes.get().getLocationTypeUUIDs())
                        .stream()
                        .map(CHSBaseEntity::getId)
                        .collect(Collectors.toList());
                return locationRepository.getVirtualCatchmentsForCatchmentIdAndLocationTypeId(catchment.getId(), locationTypeIds);
            }
            return locationRepository.getVirtualCatchmentsForCatchmentId(catchment.getId());
        }
    }

    public AddressLevelService(LocationRepository locationRepository,
                               AddressLevelTypeRepository addressLevelTypeRepository, OrganisationConfigService organisationConfigService) {
        this.locationRepository = locationRepository;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.organisationConfigService = organisationConfigService;
        this.objectMapper = ObjectMapperSingleton.getObjectMapper();
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

    public List<Long> getAllRegistrationAddressIdsBySubjectType(Catchment catchment, SubjectType subjectType) {
        return addressLevelCache.get().getAddressLevelsByCatchmentAndSubjectType(catchment, subjectType);
    }

    public String getTitleLineage(AddressLevel location) {
        return locationRepository.getTitleLineageById(location.getId());
    }
}
