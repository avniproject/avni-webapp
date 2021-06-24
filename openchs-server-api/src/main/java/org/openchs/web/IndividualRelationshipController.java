package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.OperatingIndividualScopeAwareRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.dao.individualRelationship.IndividualRelationshipRepository;
import org.openchs.dao.individualRelationship.IndividualRelationshipTypeRepository;
import org.openchs.domain.Individual;
import org.openchs.domain.SubjectType;
import org.openchs.domain.individualRelationship.IndividualRelationship;
import org.openchs.domain.individualRelationship.IndividualRelationshipType;
import org.openchs.service.UserService;
import org.openchs.web.request.IndividualRelationshipRequest;
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
public class IndividualRelationshipController extends AbstractController<IndividualRelationship> implements RestControllerResourceProcessor<IndividualRelationship>, OperatingIndividualScopeAwareController<IndividualRelationship> {
    private final IndividualRepository individualRepository;
    private final IndividualRelationshipTypeRepository individualRelationshipTypeRepository;
    private final IndividualRelationshipRepository individualRelationshipRepository;
    private final SubjectTypeRepository subjectTypeRepository;
    private final UserService userService;

    @Autowired
    public IndividualRelationshipController(IndividualRelationshipRepository individualRelationshipRepository, IndividualRepository individualRepository, IndividualRelationshipTypeRepository individualRelationshipTypeRepository, SubjectTypeRepository subjectTypeRepository, UserService userService) {
        this.individualRelationshipRepository = individualRelationshipRepository;
        this.individualRepository = individualRepository;
        this.individualRelationshipTypeRepository = individualRelationshipTypeRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.userService = userService;
    }

    @RequestMapping(value = "/individualRelationships", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
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
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<IndividualRelationship>> getByIndividualsOfCatchmentAndLastModified(
            @RequestParam("catchmentId") long catchmentId,
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(individualRelationshipRepository.findByIndividualaAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable));
    }

    @RequestMapping(value = "/individualRelationship/search/lastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<IndividualRelationship>> getByLastModified(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        return wrap(individualRelationshipRepository.findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, pageable));
    }


    @RequestMapping(value = "/individualRelationship", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<IndividualRelationship>> getIndividualRelationshipsByOperatingIndividualScope(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            @RequestParam(value = "subjectTypeUuid", required = false) String subjectTypeUuid,
            Pageable pageable) {
        if (subjectTypeUuid.isEmpty()) return wrap(new PageImpl<>(Collections.emptyList()));
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUuid);
        if (subjectType == null) return wrap(new PageImpl<>(Collections.emptyList()));
        return wrap(getCHSEntitiesForUserByLastModifiedDateTimeAndFilterByType(userService.getCurrentUser(), lastModifiedDateTime, now, subjectType.getId(), pageable));
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

    @Override
    public OperatingIndividualScopeAwareRepository<IndividualRelationship> repository() {
        return individualRelationshipRepository;
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
