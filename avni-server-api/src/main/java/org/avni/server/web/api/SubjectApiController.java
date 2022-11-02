package org.avni.server.web.api;

import org.avni.server.dao.*;
import org.avni.server.domain.*;
import org.avni.server.service.*;
import org.avni.server.util.S;
import org.avni.server.web.request.api.ApiSubjectRequest;
import org.avni.server.web.request.api.RequestUtils;
import org.avni.server.web.response.ResponsePage;
import org.avni.server.web.response.SubjectResponse;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
public class SubjectApiController {
    private final ConceptService conceptService;
    private final IndividualRepository individualRepository;
    private final ConceptRepository conceptRepository;
    private final GroupSubjectRepository groupSubjectRepository;
    private final LocationService locationService;
    private final SubjectTypeRepository subjectTypeRepository;
    private final LocationRepository locationRepository;
    private final GenderRepository genderRepository;
    private final SubjectMigrationService subjectMigrationService;
    private final IndividualService individualService;
    private final S3Service s3Service;
    @Autowired
    public SubjectApiController(ConceptService conceptService, IndividualRepository individualRepository,
                                ConceptRepository conceptRepository, GroupSubjectRepository groupSubjectRepository,
                                LocationService locationService, SubjectTypeRepository subjectTypeRepository,
                                LocationRepository locationRepository, GenderRepository genderRepository,
                                SubjectMigrationService subjectMigrationService, IndividualService individualService,
                                S3Service s3Service) {
        this.conceptService = conceptService;
        this.individualRepository = individualRepository;
        this.conceptRepository = conceptRepository;
        this.groupSubjectRepository = groupSubjectRepository;
        this.locationService = locationService;
        this.subjectTypeRepository = subjectTypeRepository;
        this.locationRepository = locationRepository;
        this.genderRepository = genderRepository;
        this.subjectMigrationService = subjectMigrationService;
        this.individualService = individualService;
        this.s3Service = s3Service;
    }

    @RequestMapping(value = "/api/subjects", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponsePage getSubjects(@RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
                                    @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
                                    @RequestParam(value = "subjectType", required = false) String subjectType,
                                    @RequestParam(value = "concepts", required = false) String concepts,
                                    @RequestParam(value= "locationIds", required = false) List<String> locationUUIDs,
                                    Pageable pageable) {
        Page<Individual> subjects;
        boolean subjectTypeRequested = S.isEmpty(subjectType);
        List<Long> allLocationIds = locationService.getAllWithChildrenForUUIDs(locationUUIDs);
        Map<Concept, String> conceptsMap = conceptService.readConceptsFromJsonObject(concepts);
        subjects = subjectTypeRequested ?
                individualRepository.findByConcepts(CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), conceptsMap, allLocationIds, pageable) :
                individualRepository.findByConceptsAndSubjectType(CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), conceptsMap, subjectType, allLocationIds, pageable);
        List<GroupSubject> groupsOfAllMemberSubjects = groupSubjectRepository.findAllByMemberSubjectIn(subjects.getContent());
        ArrayList<SubjectResponse> subjectResponses = new ArrayList<>();
        subjects.forEach(subject -> {
            subjectResponses.add(SubjectResponse.fromSubject(subject, subjectTypeRequested, conceptRepository, conceptService, findGroupAffiliation(subject, groupsOfAllMemberSubjects), s3Service));
        });
        return new ResponsePage(subjectResponses, subjects.getNumberOfElements(), subjects.getTotalPages(), subjects.getSize());
    }

    @GetMapping(value = "/api/subject/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<SubjectResponse> get(@PathVariable("id") String legacyIdOrUuid) {
        Individual subject = individualRepository.findByLegacyIdOrUuid(legacyIdOrUuid);
        if (subject == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        List<GroupSubject> groupsOfAllMemberSubjects = groupSubjectRepository.findAllByMemberSubjectIn(Collections.singletonList(subject));

        return new ResponseEntity<>(SubjectResponse.fromSubject(subject, true, conceptRepository, conceptService, groupsOfAllMemberSubjects, s3Service), HttpStatus.OK);
    }

    @PostMapping(value = "/api/subject")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public ResponseEntity post(@RequestBody ApiSubjectRequest request) {
        Individual subject = createIndividual(request.getExternalId());
        try {
            updateSubject(subject, request);
        } catch (ValidationException ve) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ve.getMessage());
        }
        return new ResponseEntity<>(SubjectResponse.fromSubject(subject, true, conceptRepository, conceptService, s3Service), HttpStatus.OK);
    }

    @PutMapping(value = "/api/subject/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    @ResponseBody
    public ResponseEntity put(@PathVariable String id, @RequestBody ApiSubjectRequest request) {
        String externalId = request.getExternalId();
        Individual subject = individualRepository.findByUuid(id);
        if (subject == null && StringUtils.hasLength(externalId)) {
            subject = individualRepository.findByLegacyId(externalId.trim());
        }
        if (subject == null) {
            throw new IllegalArgumentException(String.format("Subject not found with id '%s' or External ID '%s'", id, externalId));
        }
        try {
            subject = updateSubject(subject, request);
        } catch (ValidationException ve) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ve.getMessage());
        }
        return new ResponseEntity<>(SubjectResponse.fromSubject(subject, true, conceptRepository, conceptService, s3Service), HttpStatus.OK);
    }

    @DeleteMapping (value = "/api/subject/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<SubjectResponse> delete(@PathVariable("id") String legacyIdOrUuid) {
        Individual subject = individualRepository.findByLegacyIdOrUuid(legacyIdOrUuid);
        if (subject == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        List<GroupSubject> groupsOfAllMemberSubjects = groupSubjectRepository.findAllByMemberSubjectIn(Collections.singletonList(subject));
        subject = individualService.voidSubject(subject);
        return new ResponseEntity<>(SubjectResponse.fromSubject(subject,
                true, conceptRepository, conceptService, groupsOfAllMemberSubjects, s3Service), HttpStatus.OK);
    }

    private Individual updateSubject(Individual subject, ApiSubjectRequest request) throws ValidationException {
        SubjectType subjectType = subjectTypeRepository.findByName(request.getSubjectType());
        if (subjectType == null) {
            throw new IllegalArgumentException(String.format("Subject type not found with name '%s'", request.getSubjectType()));
        }
        Optional<AddressLevel> addressLevel = locationRepository.findByTitleLineageIgnoreCase(request.getAddress());
        if (!addressLevel.isPresent()) {
            throw new IllegalArgumentException(String.format("Address '%s' not found", request.getAddress()));
        }
        if (StringUtils.hasLength(request.getExternalId())) {
            subject.setLegacyId(request.getExternalId().trim());
        }
        subject.setSubjectType(subjectType);
        subject.setFirstName(request.getFirstName());
        if (subjectType.isAllowMiddleName())
            subject.setMiddleName(request.getMiddleName());
        subject.setLastName(request.getLastName());
        if(subjectType.isAllowProfilePicture()) {
            subject.setProfilePicture(request.getProfilePicture());
        }
        subject.setRegistrationDate(request.getRegistrationDate());
        ObservationCollection observations = RequestUtils.createObservations(request.getObservations(), conceptRepository);
        subjectMigrationService.markSubjectMigrationIfRequired(subject.getUuid(), addressLevel.get(), observations);
        subject.setAddressLevel(addressLevel.get());
        if (subjectType.isPerson()) {
            subject.setDateOfBirth(request.getDateOfBirth());
            subject.setGender(genderRepository.findByName(request.getGender()));
        }
        subject.setObservations(observations);
        subject.setRegistrationLocation(request.getRegistrationLocation());
        subject.setVoided(request.isVoided());

        subject.validate();
        return individualService.save(subject);
    }

    private List<GroupSubject> findGroupAffiliation(Individual subject, List<GroupSubject> groupSubjects) {
        return groupSubjects.stream().filter(groupSubject -> groupSubject.getMemberSubject().equals(subject)).collect(Collectors.toList());
    }

    private Individual createIndividual(String externalId) {
        if (StringUtils.hasLength(externalId)) {
            Individual individual = individualRepository.findByLegacyId(externalId.trim());
            if(individual != null) {
                return individual;
            }
        }
        Individual subject =  new Individual();
        subject.assignUUID();
        if (StringUtils.hasLength(externalId)) {
            subject.setLegacyId(externalId.trim());
        }
        return subject;
    }
}
