package org.openchs.service;

import org.openchs.application.OrganisationConfigSettingKeys;
import org.openchs.dao.AddressLevelTypeRepository;
import org.openchs.domain.AddressLevelType;
import org.openchs.domain.JsonObject;
import org.openchs.framework.security.UserContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class LocationHierarchyService {

    private final OrganisationConfigService organisationConfigService;
    private final AddressLevelTypeRepository addressLevelTypeRepository;
    private final Logger logger;

    @Autowired
    public LocationHierarchyService(OrganisationConfigService organisationConfigService, AddressLevelTypeRepository addressLevelTypeRepository) {
        this.organisationConfigService = organisationConfigService;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    public List<Long> getLowestAddressLevelTypeHierarchiesForOrganisation() {
        JsonObject organisationSettings = organisationConfigService.getOrganisationSettingsJson(UserContextHolder.getUserContext().getOrganisationId());
        ArrayList<String> lowestLevelAddressLevelTypeHierarchies = (ArrayList<String>) organisationSettings.get(String.valueOf(OrganisationConfigSettingKeys.lowestAddressLevelType));

        if (lowestLevelAddressLevelTypeHierarchies != null) {
            String[] addressLevelTypeIds = new String[lowestLevelAddressLevelTypeHierarchies.size() * 5];

            int hierarchyIndex = 0;
            for (String hierarchy : lowestLevelAddressLevelTypeHierarchies) {
                String[] hierarchyString = hierarchy.split(Pattern.quote("."));
                for (String s : hierarchyString) {
                    if (Arrays.stream(addressLevelTypeIds).noneMatch(s::equals)) {
                        addressLevelTypeIds[hierarchyIndex] = s;
                        hierarchyIndex++;
                    }
                }
            }
            return Stream.of(addressLevelTypeIds).filter(Objects::nonNull).map(Long::valueOf).collect(Collectors.toList());
        }
        return null;
    }

    public TreeSet<String> determineAddressHierarchiesToBeSaved(JsonObject organisationSettings, HashSet<String> locationConceptUuids) {
        List<AddressLevelType> addressLevelTypes = addressLevelTypeRepository.findByUuidIn(locationConceptUuids);

        TreeSet<String> addressLevelTypeHierarchies = buildHierarchyForAddressLevelTypes(addressLevelTypes);

        if (organisationSettings.containsKey(String.valueOf(OrganisationConfigSettingKeys.lowestAddressLevelType))) {
            ArrayList<String> currentAddressLevelTypeHierarchies = (ArrayList<String>) organisationSettings.get(String.valueOf(OrganisationConfigSettingKeys.lowestAddressLevelType));
            if (currentAddressLevelTypeHierarchies != null)
                addressLevelTypeHierarchies.addAll(currentAddressLevelTypeHierarchies);
        }

        return filterHierarchiesWithCommonAncestries(addressLevelTypeHierarchies);
    }

    public TreeSet<String> buildHierarchyForAddressLevelTypes(List<AddressLevelType> addressLevelTypes) {
        TreeSet<String> addressLevelTypeHierarchies = new TreeSet<>();

        addressLevelTypes.forEach(addressLevelType -> {
            StringBuilder hierarchy = new StringBuilder(addressLevelType.getId().toString());
            Optional<AddressLevelType> parent = Optional.ofNullable(addressLevelType.getParent());
            while (parent.isPresent()) {
                hierarchy.insert(0, parent.get().getId().toString() + ".");
                parent = (parent.get().getParent() != null) ?
                        addressLevelTypeRepository.findById(parent.get().getParentId())
                        :
                        Optional.empty();
            }
            addressLevelTypeHierarchies.add(hierarchy.toString());
        });

        return addressLevelTypeHierarchies;
    }

    public TreeSet<String> filterHierarchiesWithCommonAncestries(TreeSet<String> addressLevelTypeHierarchies) {
        if (addressLevelTypeHierarchies.size() > 1) {
            TreeSet<String> dolly = new TreeSet<>(addressLevelTypeHierarchies); //cloning in order to iterate and compare the next element with the current one
            Iterator<String> oneStepAheadIterator = dolly.iterator();
            oneStepAheadIterator.next();
            Iterator<String> addressLevelTypeHierarchiesIterator = addressLevelTypeHierarchies.iterator();
            addressLevelTypeHierarchiesIterator.forEachRemaining(key -> {
                if (oneStepAheadIterator.hasNext() && oneStepAheadIterator.next().startsWith(key)) {
                    addressLevelTypeHierarchiesIterator.remove();
                }
            });
        }
        return addressLevelTypeHierarchies;
    }
}
