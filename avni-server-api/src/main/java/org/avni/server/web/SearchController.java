package org.avni.server.web;

import org.avni.server.dao.AddressLevelTypeRepository;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.LocationRepository;
import org.avni.server.domain.Concept;
import org.avni.server.web.request.AddressLevelContractWeb;
import org.avni.server.web.request.AddressLevelTypeContract;
import org.avni.server.web.request.ConceptContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class SearchController {
    private final ConceptRepository conceptRepository;
    private final LocationRepository locationRepository;
    private final AddressLevelTypeRepository addressLevelTypeRepository;

    @Autowired
    @Lazy
    public SearchController(ConceptRepository conceptRepository,
                            LocationRepository locationRepository,
                            AddressLevelTypeRepository addressLevelTypeRepository) {
        this.conceptRepository = conceptRepository;
        this.locationRepository = locationRepository;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
    }

    @RequestMapping(value = "/search/concept", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user')")
    public List<ConceptContract> searchConcept(@RequestParam String name,
                                               @RequestParam(required = false) String dataType) {
        if (dataType == null) {
            return getConceptContract(conceptRepository.findByIsVoidedFalseAndActiveTrueAndNameIgnoreCaseContains(name));
        } else {
            return getConceptContract(conceptRepository.findByIsVoidedFalseAndActiveTrueAndDataTypeAndNameIgnoreCaseContains(dataType, name));
        }
    }

    @RequestMapping(value = "/search/location", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public List<AddressLevelContractWeb> searchLocation(@RequestParam String name) {
        return locationRepository.findByIsVoidedFalseAndTitleIgnoreCaseContains(name)
                .stream()
                .map(AddressLevelContractWeb::fromEntity)
                .collect(Collectors.toList());
    }

    @RequestMapping(value = "/search/locationType", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public List<AddressLevelTypeContract> searchLocationType(@RequestParam String name) {
        return addressLevelTypeRepository.findByIsVoidedFalseAndNameIgnoreCaseContains(name)
                .stream()
                .map(AddressLevelTypeContract::fromAddressLevelType)
                .collect(Collectors.toList());
    }

    private List<ConceptContract> getConceptContract(List<Concept> concepts) {
        return concepts
                .stream()
                .map(Concept::toConceptContract)
                .collect(Collectors.toList());
    }


}
