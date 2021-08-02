package org.openchs.web.api;

import org.joda.time.DateTime;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.GroupSubjectRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.GroupSubject;
import org.openchs.domain.Individual;
import org.openchs.service.ConceptService;
import org.openchs.util.S;
import org.openchs.web.response.ResponsePage;
import org.openchs.web.response.SubjectResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class SubjectApiController {
    private final ConceptService conceptService;
    private final IndividualRepository individualRepository;
    private final ConceptRepository conceptRepository;
    private final GroupSubjectRepository groupSubjectRepository;

    public SubjectApiController(ConceptService conceptService, IndividualRepository individualRepository, ConceptRepository conceptRepository, GroupSubjectRepository groupSubjectRepository) {
        this.conceptService = conceptService;
        this.individualRepository = individualRepository;
        this.conceptRepository = conceptRepository;
        this.groupSubjectRepository = groupSubjectRepository;
    }

    @RequestMapping(value = "/api/subjects", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public ResponsePage getSubjects(@RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
                                    @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
                                    @RequestParam(value = "subjectType", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) String subjectType,
                                    @RequestParam(value = "concepts", required = false) String concepts,
                                    Pageable pageable) {
        Page<Individual> subjects;
        boolean subjectTypeRequested = S.isEmpty(subjectType);
        Map<Concept, String> conceptsMap = conceptService.readConceptsFromJsonObject(concepts);
        subjects = subjectTypeRequested ?
                individualRepository.findByConcepts(lastModifiedDateTime, now, conceptsMap, pageable) :
                individualRepository.findByConceptsAndSubjectType(lastModifiedDateTime, now, conceptsMap, subjectType, pageable);
        List<GroupSubject> groupsOfAllMemberSubjects = groupSubjectRepository.findAllByMemberSubjectIn(subjects.getContent());
        ArrayList<SubjectResponse> subjectResponses = new ArrayList<>();
        subjects.forEach(subject -> {
            subjectResponses.add(SubjectResponse.fromSubject(subject, subjectTypeRequested, conceptRepository, conceptService, findGroupAffiliation(subject, groupsOfAllMemberSubjects)));
        });
        return new ResponsePage(subjectResponses, subjects.getNumberOfElements(), subjects.getTotalPages(), subjects.getSize());
    }

    @GetMapping(value = "/api/subject/{id}")
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @ResponseBody
    public ResponseEntity<SubjectResponse> get(@PathVariable("id") String uuid) {
        Individual subject = individualRepository.findByUuid(uuid);
        if (subject == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        List<GroupSubject> groupsOfAllMemberSubjects = groupSubjectRepository.findAllByMemberSubjectIn(Collections.singletonList(subject));
        return new ResponseEntity<>(SubjectResponse.fromSubject(subject, true, conceptRepository, conceptService, groupsOfAllMemberSubjects), HttpStatus.OK);
    }

    private List<GroupSubject> findGroupAffiliation(Individual subject, List<GroupSubject> groupSubjects) {
        return groupSubjects.stream().filter(groupSubject -> groupSubject.getMemberSubject().equals(subject)).collect(Collectors.toList());
    }
}
