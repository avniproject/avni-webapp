package org.avni.importer.batch.csv.writer;

import org.avni.application.FormType;
import org.avni.builder.BuilderException;
import org.avni.dao.AddressLevelTypeRepository;
import org.avni.dao.LocationRepository;
import org.avni.dao.application.FormRepository;
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
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

import static java.lang.String.format;

@StepScope
@Component
public class LocationWriter implements ItemWriter<Row> {

    private static final LocationHeaders headers = new LocationHeaders();
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
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws Exception {
        List<String> allErrorMsgs = new ArrayList<>();
        checkIfHeaderHasLocationTypes(this.locationTypeNames, row.getHeaders(), allErrorMsgs);
        AddressLevel parent = null;
        AddressLevel location = null;
        for (String header : row.getHeaders()) {
            if (isValidLocation(header, row, this.locationTypeNames)) {
                location = createAddressLevel(row, parent, header);
                parent = location;
            } //This will get called only when location have extra properties
            else if (location != null && !this.locationTypeNames.contains(row.get(header))) {
                location.setGpsCoordinates(locationCreator.getLocation(row, headers.gpsCoordinates, allErrorMsgs));
                location.setLocationProperties(observationCreator.getObservations(row, headers, allErrorMsgs, FormType.Location, location.getLocationProperties()));
                locationRepository.save(location);
            }
        }
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
}
