package org.avni.server.web;

import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.SubjectTypeRepository;
import org.avni.server.dao.SyncParameters;
import org.avni.server.dao.individualRelationship.IndividualRelationshipRepository;
import org.avni.server.dao.individualRelationship.IndividualRelationshipTypeRepository;
import org.avni.server.domain.CHSEntity;
import org.avni.server.domain.Individual;
import org.avni.server.domain.SubjectType;
import org.avni.server.domain.individualRelationship.IndividualRelationship;
import org.avni.server.domain.individualRelationship.IndividualRelationshipType;
import org.avni.server.service.ScopeBasedSyncService;
import org.avni.server.service.UserService;
import org.avni.server.web.request.IndividualRelationshipRequest;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.Collections;
import java.util.Optional;

@RestController
public class IndividualRelationshipController extends AbstractController<IndividualRelationship> implements RestControllerResourceProcessor<IndividualRelationship> {
    private final IndividualRepository individualRepository;
    private final IndividualRelationshipTypeRepository individualRelationshipTypeRepository;
    private final IndividualRelationshipRepository individualRelationshipRepository;
    private final SubjectTypeRepository subjectTypeRepository;
    private final UserService userService;
    private ScopeBasedSyncService<IndividualRelationship> scopeBasedSyncService;

    @Autowired
    public IndividualRelationshipController(IndividualRelationshipRepository individualRelationshipRepository, IndividualRepository individualRepository, IndividualRelationshipTypeRepository individualRelationshipTypeRepository, SubjectTypeRepository subjectTypeRepository, UserService userService, ScopeBasedSyncService<IndividualRelationship> scopeBasedSyncService) {
        this.individualRelationshipRepository = individualRelationshipRepository;
        this.individualRepository = individualRepository;
        this.individualRelationshipTypeRepository = individualRelationshipTypeRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.userService = userService;
        this.scopeBasedSyncService = scopeBasedSyncService;
    }

    @RequestMapping(value = "/individualRelationships", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public void save(@RequestBody IndividualRelationshipRequest request) {
        IndividualRelationshipType relationshipType = individualRelationshipTypeRepository.findByUuid(request.getRelationshipTypeUUID());
        Individual individualA = individualRepository.findByUuid(request.getIndividualAUUID());
        Individual individualB = individualRepository.findByUuid(request.getIndividualBUUID());

        IndividualRelationship individualRelationship = newOrExistingEntity(individualRelationshipRepository, request, new IndividualRelationship());
        individualRelationship.setIndividuala(individualA);
        individualRelationship.setRelationship(relationshipType);
        individualRelationship.setIndividualB(individualB);
        individualRelationship.setEnterDateTime(request.getEnterDateTime());
        individualRelationship.setExitDateTime(request.getExitDateTime());
        individualRelationship.setVoided(request.isVoided());

        individualRelationshipRepository.save(individualRelationship);
    }

    @RequestMapping(value = "/individualRelationship/search/byIndividualsOfCatchmentAndLastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<IndividualRelationship>> getByIndividualsOfCatchmentAndLastModified(
            @RequestParam("catchmentId") long catchmentId,
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(individualRelationshipRepository.findByIndividualaAddressLevelVirtualCatchmentsIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(catchmentId, CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), pageable));
    }

    @RequestMapping(value = "/individualRelationship/search/lastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<IndividualRelationship>> getByLastModified(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(individualRelationshipRepository.findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, pageable));
    }


    @RequestMapping(value = "/individualRelationship", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<IndividualRelationship>> getIndividualRelationshipsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "subjectTypeUuid", required = false) String subjectTypeUuid,
            Pageable pageable) {
        if (subjectTypeUuid.isEmpty()) return wrap(new PageImpl<>(Collections.emptyList()));
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUuid);
        if (subjectType == null) return wrap(new PageImpl<>(Collections.emptyList()));
        return wrap(scopeBasedSyncService.getSyncResultsBySubjectTypeRegistrationLocation(individualRelationshipRepository, userService.getCurrentUser(), lastModifiedDateTime, now, subjectType.getId(), pageable, subjectType, SyncParameters.SyncEntityName.IndividualRelationShip));
    }

    @Override
    public Resource<IndividualRelationship> process(Resource<IndividualRelationship> resource) {
        IndividualRelationship individualRelationship = resource.getContent();
        resource.removeLinks();
        resource.add(new Link(individualRelationship.getRelationship().getUuid(), "relationshipTypeUUID"));
        resource.add(new Link(individualRelationship.getIndividuala().getUuid(), "individualAUUID"));
        resource.add(new Link(individualRelationship.getIndividualB().getUuid(), "individualBUUID"));
        return resource;
    }


    @DeleteMapping(value = "/web/relationShip/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    @Transactional
    public void deleteIndividualRelationShip(@PathVariable Long id) {
        Optional<IndividualRelationship> relationShip = individualRelationshipRepository.findById(id);
        if (relationShip.isPresent()) {
            IndividualRelationship individualRelationShip = relationShip.get();
            individualRelationShip.setVoided(true);
            individualRelationshipRepository.save(individualRelationShip);
        }
    }
}
