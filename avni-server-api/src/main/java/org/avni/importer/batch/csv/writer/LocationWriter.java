package org.avni.importer.batch.csv.writer;

import org.avni.application.FormType;
import org.avni.builder.BuilderException;
import org.avni.dao.AddressLevelTypeRepository;
import org.avni.dao.LocationRepository;
import org.avni.domain.AddressLevel;
import org.avni.domain.AddressLevelType;
import org.avni.importer.batch.csv.creator.LocationCreator;
import org.avni.importer.batch.csv.creator.ObservationCreator;
import org.avni.importer.batch.csv.writer.header.LocationHeaders;
import org.avni.importer.batch.model.Row;
import org.avni.service.LocationService;
import org.avni.util.S;
import org.avni.web.request.LocationContract;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;


@StepScope
@Component
public class LocationWriter implements ItemWriter<Row> {

    private static final LocationHeaders headers = new LocationHeaders();
    @Value("#{jobParameters['locationUploadMode']}")
    private String locationUploadMode;
    private LocationService locationService;
    private LocationRepository locationRepository;
    private AddressLevelTypeRepository addressLevelTypeRepository;
    private LocationCreator locationCreator;
    private ObservationCreator observationCreator;
    private List<String> locationTypeNames;

    @Autowired
    public LocationWriter(LocationService locationService,
                          LocationRepository locationRepository,
                          AddressLevelTypeRepository addressLevelTypeRepository,
                          ObservationCreator observationCreator) {
        this.locationService = locationService;
        this.locationRepository = locationRepository;
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.observationCreator = observationCreator;
        this.locationCreator = new LocationCreator();
    }

    @PostConstruct
    public void init() {
        List<AddressLevelType> locationTypes = addressLevelTypeRepository.findAllByIsVoidedFalse();
        locationTypes.sort(Comparator.comparingDouble(AddressLevelType::getLevel).reversed());
        this.locationTypeNames = locationTypes.stream().map(AddressLevelType::getName).collect(Collectors.toList());
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) {
            List<String> allErrorMsgs = new ArrayList<>();
            checkIfHeaderHasLocationTypes(this.locationTypeNames, row.getHeaders(), allErrorMsgs);
            if (LocationUploadMode.isRelaxedMode(locationUploadMode)) {
                relaxedWriter(row, allErrorMsgs);
            } else {
                strictWriter(row, allErrorMsgs);
            }
        }
    }

    private void strictWriter(Row row, List<String> allErrorMsgs) throws Exception {
        Map<String, String> nonEmptyLocations = new LinkedHashMap<>();
        for (String header : row.getHeaders()) {
            if(this.locationTypeNames.contains(header) && !S.isEmpty(row.get(header))) {
                nonEmptyLocations.put(header, row.get(header));
            }
        }
        List<Map.Entry<String, String>> allNonEmptyLocations = new ArrayList<>(nonEmptyLocations.entrySet());
        Map.Entry<String, String> parentEntry = ensureAllParentExists(allErrorMsgs, allNonEmptyLocations);
        Map.Entry<String, String> locationEntry = allNonEmptyLocations.get(allNonEmptyLocations.size() - 1);
        String id = row.get(getIdColumnHeaderName(row));
        AddressLevel parent = parentEntry == null ? null : locationRepository.findByTitleIgnoreCaseAndTypeNameAndIsVoidedFalse(parentEntry.getValue(), parentEntry.getKey());
        AddressLevel existingLocation = !S.isEmpty(id) ? locationRepository.findByLegacyIdOrUuid(id) :
                locationRepository.findByParentAndTitleIgnoreCaseAndIsVoidedFalse(parent, locationEntry.getValue());
        if (existingLocation != null) {
            updateExistingLocation(existingLocation, parent, row, allErrorMsgs, id);
        } else {
            AddressLevel location = createAddressLevel(row, parent, locationEntry.getKey());
            updateLocationProperties(row, allErrorMsgs, location, locationEntry.getKey());
        }
    }

    private String getIdColumnHeaderName(Row row) {
        return Arrays.stream(row.getHeaders()).filter(s -> s.equalsIgnoreCase("id")).findAny().orElse("");
    }

    private void relaxedWriter(Row row, List<String> allErrorMsgs) throws Exception {
        AddressLevel parent = null;
        AddressLevel location = null;
        for (String header : row.getHeaders()) {
            if (isValidLocation(header, row, this.locationTypeNames)) {
                location = createAddressLevel(row, parent, header);
                parent = location;
            } //This will get called only when location have extra properties
            if (location != null && !this.locationTypeNames.contains(header)) {
                updateLocationProperties(row, allErrorMsgs, location, header);
            }
        }
    }

    private void updateLocationProperties(Row row, List<String> allErrorMsgs, AddressLevel location, String header) throws Exception {
        location.setGpsCoordinates(locationCreator.getLocation(row, headers.gpsCoordinates, allErrorMsgs));
        location.setLocationProperties(observationCreator.getObservations(row, headers, allErrorMsgs, FormType.Location, location.getLocationProperties()));
        locationRepository.save(location);
    }

    private void checkIfHeaderHasLocationTypes(List<String> locationTypeNames, String[] headers, List<String> allErrorMsgs) throws Exception {
        // There can be location properties in the header, so we save other values as locationProperties
        if (Collections.disjoint(locationTypeNames, Arrays.asList(headers))) {
            allErrorMsgs.add("No location type found in the header, either create location types or specify it correctly in the file header");
            throw new Exception(String.join(", ", allErrorMsgs));
        }
    }

    private AddressLevel createAddressLevel(Row row, AddressLevel parent, String header) throws BuilderException {
        AddressLevel location;
        location = locationRepository.findByParentAndTitleIgnoreCaseAndIsVoidedFalse(parent, row.get(header));
        if (location == null) {
            LocationContract locationContract = new LocationContract();
            locationContract.setupUuidIfNeeded();
            locationContract.setName(row.get(header));
            locationContract.setType(header);
            locationContract.setLevel(parent == null ? row.getHeaders().length : parent.getLevel() - 1);
            if (parent != null) {
                locationContract.setParent(new LocationContract(parent.getUuid()));
            }
            location = locationService.save(locationContract);
        }
        return location;
    }

    private boolean isValidLocation(String header, Row row, List<String> locationTypeNames) {
        return locationTypeNames.contains(header) && !S.isEmpty(row.get(header));
    }

    private void updateExistingLocation(AddressLevel location, AddressLevel parent, Row row, List<String> allErrorMsgs, String id) throws Exception {
        String header = location.getTypeString();
        String lineage = parent == null ? location.getId().toString() : parent.getLineage().concat(".").concat(location.getId().toString());
        location.setTitle(row.get(header));
        location.setParent(parent);
        location.setLegacyId(id);
        location.setLineage(lineage);
        updateLocationProperties(row, allErrorMsgs, location, header);
    }

    private Map.Entry<String, String> ensureAllParentExists(List<String> allErrorMsgs, List<Map.Entry<String, String>> allNonEmptyLocations) throws Exception {
        Map.Entry<String, String> parentEntry = null;
        for (int i = 0; i < allNonEmptyLocations.size() - 1; i++) {
            Map.Entry<String, String> locationEntry = allNonEmptyLocations.get(i);
            String type = locationEntry.getKey();
            String title = locationEntry.getValue();
            String parent = parentEntry == null ? null : parentEntry.getValue();
            AddressLevel location = locationRepository.findLocationByTitleTypeAndParentName(title, type, parent);
            if (location == null) {
                allErrorMsgs.add(String.format("No location found with name %s, type %s and parent %s", title, type, parent));
                throw new Exception(String.join(", ", allErrorMsgs));
            }
            parentEntry = locationEntry;
        }
        return parentEntry;
    }

    public void setLocationUploadMode(String locationUploadMode) {
        this.locationUploadMode = locationUploadMode;
    }

    private enum LocationUploadMode {
        relaxed, strict;

        public static boolean isRelaxedMode(String mode) {
            return mode == null || LocationUploadMode.valueOf(mode).equals(relaxed);
        }
    }
}
