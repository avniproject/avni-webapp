package org.openchs.importer.batch.csv.writer;

import org.openchs.application.FormType;
import org.openchs.builder.BuilderException;
import org.openchs.dao.AddressLevelTypeRepository;
import org.openchs.dao.LocationRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.AddressLevelType;
import org.openchs.importer.batch.csv.creator.LocationCreator;
import org.openchs.importer.batch.csv.creator.ObservationCreator;
import org.openchs.importer.batch.csv.writer.header.LocationHeaders;
import org.openchs.importer.batch.model.Row;
import org.openchs.service.LocationService;
import org.openchs.util.S;
import org.openchs.web.request.LocationContract;
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
        if (allErrorMsgs.size() > 0) {
            throw new Exception(String.join(", ", allErrorMsgs));
        }
    }

    private void checkIfHeaderHasLocationTypes(List<String> locationTypeNames, String[] headers, List<String> allErrorMsgs) throws Exception {
        for (String header : headers) {
            if (!locationTypeNames.contains(header)) {
                allErrorMsgs.add(format("Location type %s not found", header));
                throw new Exception(String.join(", ", allErrorMsgs));
            }
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
