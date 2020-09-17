package org.openchs.importer.batch.csv.writer;

import org.joda.time.LocalDate;
import org.openchs.application.FormType;
import org.openchs.application.Subject;
import org.openchs.dao.AddressLevelTypeRepository;
import org.openchs.dao.GenderRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.LocationRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.AddressLevelType;
import org.openchs.domain.Gender;
import org.openchs.domain.Individual;
import org.openchs.importer.batch.csv.writer.header.SubjectHeaders;
import org.openchs.importer.batch.csv.creator.LocationCreator;
import org.openchs.importer.batch.csv.creator.ObservationCreator;
import org.openchs.importer.batch.csv.creator.SubjectTypeCreator;
import org.openchs.importer.batch.model.Row;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Stream;


@Component
public class SubjectWriter implements ItemWriter<Row>, Serializable {

    private final AddressLevelTypeRepository addressLevelTypeRepository;
    private final LocationRepository locationRepository;
    private final IndividualRepository individualRepository;
    private final GenderRepository genderRepository;
    private static final SubjectHeaders headers = new SubjectHeaders();
    private SubjectTypeCreator subjectTypeCreator;
    private ObservationCreator observationCreator;
    private LocationCreator locationCreator;

    @Autowired
    public SubjectWriter(AddressLevelTypeRepository addressLevelTypeRepository,
                         LocationRepository locationRepository,
                         IndividualRepository individualRepository, GenderRepository genderRepository, SubjectTypeCreator subjectTypeCreator, ObservationCreator observationCreator) {
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.locationRepository = locationRepository;
        this.individualRepository = individualRepository;
        this.genderRepository = genderRepository;
        this.subjectTypeCreator = subjectTypeCreator;
        this.observationCreator = observationCreator;
        this.locationCreator = new LocationCreator();
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws Exception {
        List<AddressLevelType> locationTypes = addressLevelTypeRepository.findAllByIsVoidedFalse();
        locationTypes.sort(Comparator.comparingDouble(AddressLevelType::getLevel).reversed());

        List<AddressLevel> locations = locationRepository.findAllByIsVoidedFalse();

        Individual individual = getOrCreateIndividual(row);
        List<String> allErrorMsgs = new ArrayList<>();

        individual.setSubjectType(subjectTypeCreator.getSubjectType(row.get(headers.subjectType), allErrorMsgs, headers.subjectType));
        individual.setFirstName(row.get(headers.firstName));
        individual.setLastName(row.get(headers.lastName));
        setDateOfBirth(individual, row, allErrorMsgs);
        individual.setDateOfBirthVerified(row.getBool(headers.dobVerified));
        setRegistrationDate(individual, row, allErrorMsgs);
        individual.setRegistrationLocation(locationCreator.getLocation(row, headers.registrationLocation, allErrorMsgs));
        setAddressLevel(individual, row, locationTypes, locations, allErrorMsgs);
        individual.setObservations(observationCreator.getObservations(row, headers, allErrorMsgs, FormType.IndividualProfile, individual.getObservations()));
        if (individual.getSubjectType().getType().equals(Subject.Person)) setGender(individual, row, allErrorMsgs);

        if (allErrorMsgs.size() > 0) {
            throw new Exception(String.join(", ", allErrorMsgs));
        }

        individual.setVoided(false);
        individual.assignUUIDIfRequired();

        individualRepository.save(individual);
    }

    private Individual getOrCreateIndividual(Row row) {
        String externalId = row.get(headers.id);
        Individual existingIndividual = null;
        if (!(externalId == null || externalId.isEmpty())) {
            existingIndividual = individualRepository.findByLegacyId(externalId);
        }
        return existingIndividual == null ? createNewIndividual(externalId) : existingIndividual;
    }

    private Individual createNewIndividual(String externalId) {
        Individual individual = new Individual();
        individual.setLegacyId(externalId);
        return individual;
    }

    private void setDateOfBirth(Individual individual, Row row, List<String> errorMsgs) {
        try {
            String dob = row.get(headers.dateOfBirth);
            if (dob != null && !dob.trim().isEmpty())
                individual.setDateOfBirth(LocalDate.parse(dob));
        } catch (Exception ex) {
            errorMsgs.add(String.format("Invalid '%s'", headers.dateOfBirth));
        }
    }

    private void setRegistrationDate(Individual individual, Row row, List<String> errorMsgs) {
        try {
            String registrationDate = row.get(headers.registrationDate);
            individual.setRegistrationDate(registrationDate != null && !registrationDate.trim().isEmpty() ? LocalDate.parse(registrationDate) : LocalDate.now());
        } catch (Exception ex) {
            errorMsgs.add(String.format("Invalid '%s'", headers.registrationDate));
        }
    }

    private void setGender(Individual individual, Row row, List<String> errorMsgs) {
        try {
            String genderName = row.get(headers.gender);
            Gender gender = genderRepository.findByNameIgnoreCase(genderName);
            if (gender == null) {
                errorMsgs.add(String.format("Invalid '%s' - '%s'", headers.gender, genderName));
                return;
            }
            individual.setGender(gender);
        } catch (Exception ex) {
            errorMsgs.add(String.format("Invalid '%s'", headers.gender));
        }
    }

    private void setAddressLevel(Individual individual,
                                 Row row,
                                 List<AddressLevelType> locationTypes,
                                 List<AddressLevel> locations,
                                 List<String> errorMsgs) {
        try {
            AddressLevel addressLevel;
            AddressLevelType lowestAddressLevelType = locationTypes.get(locationTypes.size() - 1);

            String lowestInputAddressLevel = row.get(lowestAddressLevelType.getName());
            if (lowestInputAddressLevel == null)
                throw new Exception(String.format("Missing '%s'", lowestAddressLevelType.getName()));

            Supplier<Stream<AddressLevel>> addressMatches = () ->
                    locations.stream()
                            .filter(location ->
                                    location.getTitle()
                                            .toLowerCase()
                                            .equals(lowestInputAddressLevel.toLowerCase()));

            if (addressMatches.get().count() > 1) {
                // filter by lineage if more than one location with same name present
                addressLevel = getAddressLevelByLineage(row, locationTypes, locations);
            } else {
                // exactly 1 or no match
                addressLevel = addressMatches.get().findFirst().orElseThrow(() -> new Exception("'Address' not found"));
            }
            individual.setAddressLevel(addressLevel);
        } catch (Exception ex) {
            errorMsgs.add(ex.getMessage());
        }
    }

    private AddressLevel getAddressLevelByLineage(Row row,
                                                  List<AddressLevelType> locationTypes,
                                                  List<AddressLevel> locations) throws Exception {
        List<String> inputLocations = new ArrayList<>();
        for (AddressLevelType addressLevelType : locationTypes) {
            String _location = row.get(addressLevelType.getName());
            if (_location != null)
                inputLocations.add(_location);
        }

        if (inputLocations.size() == 0)
            throw new Exception("Invalid address");

        String lineage = String.join(", ", inputLocations);
        return locations.stream()
                .filter(location ->
                        location.getTitleLineage()
                                .toLowerCase()
                                .endsWith(lineage.toLowerCase()))
                .findFirst()
                .orElseThrow(() -> new Exception("'Address' not found"));
    }
}
