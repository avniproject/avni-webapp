package org.avni.importer.batch.csv.writer;

import org.avni.application.FormMapping;
import org.avni.application.FormType;
import org.avni.application.Subject;
import org.avni.application.projections.LocationProjection;
import org.avni.dao.AddressLevelTypeRepository;
import org.avni.dao.GenderRepository;
import org.avni.dao.IndividualRepository;
import org.avni.dao.LocationRepository;
import org.avni.dao.application.FormMappingRepository;
import org.avni.domain.*;
import org.avni.importer.batch.csv.contract.UploadRuleServerResponseContract;
import org.avni.importer.batch.csv.creator.*;
import org.avni.importer.batch.csv.writer.header.SubjectHeaders;
import org.avni.importer.batch.model.Row;
import org.avni.service.*;
import org.jadira.usertype.spi.utils.lang.StringUtils;
import org.joda.time.LocalDate;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Stream;


@Component
public class SubjectWriter implements ItemWriter<Row>, Serializable {

    private static final SubjectHeaders headers = new SubjectHeaders();
    private final AddressLevelTypeRepository addressLevelTypeRepository;
    private final LocationRepository locationRepository;
    private final IndividualRepository individualRepository;
    private final GenderRepository genderRepository;
    private SubjectTypeCreator subjectTypeCreator;
    private LocationCreator locationCreator;
    private EntityApprovalStatusService entityApprovalStatusService;
    private FormMappingRepository formMappingRepository;
    private ObservationService observationService;
    private RuleServerInvoker ruleServerInvoker;
    private VisitCreator visitCreator;
    private DecisionCreator decisionCreator;
    private ObservationCreator observationCreator;
    private final IndividualService individualService;
    private final AddressLevelService addressLevelService;
    private final S3Service s3Service;
    private final EntityApprovalStatusWriter entityApprovalStatusWriter;

    @Value("${avni.skipUploadValidations}")
    private boolean skipUploadValidations;

    @Autowired
    public SubjectWriter(AddressLevelTypeRepository addressLevelTypeRepository,
                         LocationRepository locationRepository,
                         IndividualRepository individualRepository,
                         GenderRepository genderRepository,
                         SubjectTypeCreator subjectTypeCreator,
                         EntityApprovalStatusService entityApprovalStatusService,
                         FormMappingRepository formMappingRepository,
                         ObservationService observationService,
                         RuleServerInvoker ruleServerInvoker,
                         VisitCreator visitCreator,
                         DecisionCreator decisionCreator,
                         ObservationCreator observationCreator, IndividualService individualService, EntityApprovalStatusWriter entityApprovalStatusWriter,
                         AddressLevelService addressLevelService, S3Service s3Service) {
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.locationRepository = locationRepository;
        this.individualRepository = individualRepository;
        this.genderRepository = genderRepository;
        this.subjectTypeCreator = subjectTypeCreator;
        this.entityApprovalStatusService = entityApprovalStatusService;
        this.formMappingRepository = formMappingRepository;
        this.observationService = observationService;
        this.ruleServerInvoker = ruleServerInvoker;
        this.visitCreator = visitCreator;
        this.decisionCreator = decisionCreator;
        this.observationCreator = observationCreator;
        this.individualService = individualService;
        this.addressLevelService = addressLevelService;
        this.entityApprovalStatusWriter = entityApprovalStatusWriter;
        this.locationCreator = new LocationCreator();
        this.s3Service = s3Service;
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws Exception {
        List<AddressLevelType> locationTypes = addressLevelTypeRepository.findAllByIsVoidedFalse();
        locationTypes.sort(Comparator.comparingDouble(AddressLevelType::getLevel).reversed());

        List<LocationProjection> locations = locationRepository.findAllNonVoided();

        Individual individual = getOrCreateIndividual(row);
        List<String> allErrorMsgs = new ArrayList<>();

        SubjectType subjectType = subjectTypeCreator.getSubjectType(row.get(headers.subjectType), headers.subjectType);
        individual.setSubjectType(subjectType);
        individual.setFirstName(row.get(headers.firstName));
        individual.setLastName(row.get(headers.lastName));
        setDateOfBirth(individual, row, allErrorMsgs);
        individual.setDateOfBirthVerified(row.getBool(headers.dobVerified));
        setRegistrationDate(individual, row, allErrorMsgs);
        individual.setRegistrationLocation(locationCreator.getLocation(row, headers.registrationLocation, allErrorMsgs));
        setAddressLevel(individual, row, locationTypes, locations, allErrorMsgs);
        if (individual.getSubjectType().getType().equals(Subject.Person)) setGender(individual, row);
        FormMapping formMapping = formMappingRepository.getRegistrationFormMapping(subjectType);
        individual.setVoided(false);
        individual.assignUUIDIfRequired();
        if (formMapping == null) {
            throw new Exception(String.format("No form found for the subject type %s", subjectType.getName()));
        }
        Individual savedIndividual;
        if (skipUploadValidations) {
            individual.setObservations(observationCreator.getObservations(row, headers, allErrorMsgs, FormType.IndividualProfile, individual.getObservations()));
            savedIndividual = individualService.save(individual);
        } else {
            UploadRuleServerResponseContract ruleResponse = ruleServerInvoker.getRuleServerResult(row, formMapping.getForm(), individual, allErrorMsgs);
            individual.setObservations(observationService.createObservations(ruleResponse.getObservations()));
            decisionCreator.addRegistrationDecisions(individual.getObservations(), ruleResponse.getDecisions());
            savedIndividual = individualService.save(individual);
            visitCreator.saveScheduledVisits(formMapping.getType(), savedIndividual.getUuid(), null, ruleResponse.getVisitSchedules(), null);
        }
        entityApprovalStatusWriter.saveStatus(formMapping, savedIndividual.getId(), EntityApprovalStatus.EntityType.Subject);
    }

    private Individual getOrCreateIndividual(Row row) {
        String id = row.get(headers.id);
        Individual existingIndividual = null;
        if (!(id == null || id.isEmpty())) {
            existingIndividual = individualRepository.findByLegacyIdOrUuid(id);
        }
        return existingIndividual == null ? createNewIndividual(id) : existingIndividual;
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

    private void setGender(Individual individual, Row row) throws Exception {
        try {
            String genderName = row.get(headers.gender);
            Gender gender = genderRepository.findByNameIgnoreCase(genderName);
            if (gender == null) {
                throw new Exception(String.format("Invalid '%s' - '%s'", headers.gender, genderName));
            }
            individual.setGender(gender);
        } catch (Exception ex) {
            throw new Exception(String.format("Invalid '%s'", headers.gender));
        }
    }

    private void setAddressLevel(Individual individual,
                                 Row row,
                                 List<AddressLevelType> locationTypes,
                                 List<LocationProjection> locations,
                                 List<String> errorMsgs) {
        try {
            LocationProjection addressLevel;
            AddressLevelType lowestAddressLevelType = locationTypes.get(locationTypes.size() - 1);

            String lowestInputAddressLevel = row.get(lowestAddressLevelType.getName());
            if (lowestInputAddressLevel == null)
                throw new Exception(String.format("Missing '%s'", lowestAddressLevelType.getName()));

            Supplier<Stream<LocationProjection>> addressMatches = () ->
                    locations.stream()
                            .filter(location ->
                                    location.getTitle().toLowerCase().equals(lowestInputAddressLevel.toLowerCase()) &&
                                            location.getTypeString().equals(lowestAddressLevelType.getName()));

            if (addressMatches.get().count() > 1) {
                // filter by lineage if more than one location with same name present
                addressLevel = getAddressLevelByLineage(row, locationTypes, locations);
            } else {
                // exactly 1 or no match
                addressLevel = addressMatches.get().findFirst().orElseThrow(() -> new Exception("'Address' not found"));
            }
            individual.setAddressLevel(locationRepository.findByUuid(addressLevel.getUuid()));
        } catch (Exception ex) {
            errorMsgs.add(ex.getMessage());
        }
    }

    private LocationProjection getAddressLevelByLineage(Row row,
                                                  List<AddressLevelType> locationTypes,
                                                  List<LocationProjection> locations) throws Exception {
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
