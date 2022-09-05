package org.avni.service;

import org.avni.dao.*;
import org.avni.domain.*;
import org.avni.framework.security.UserContextHolder;
import org.avni.projection.UserWebProjection;
import org.avni.web.request.ConceptContract;
import org.avni.web.request.GroupContract;
import org.avni.web.request.webapp.search.SubjectSearchRequest;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserSubjectAssignmentService implements NonScopeAwareService {

    private final UserSubjectAssignmentRepository userSubjectAssignmentRepository;
    private final UserRepository userRepository;
    private final SubjectTypeRepository subjectTypeRepository;
    private final ProgramRepository programRepository;
    private final GroupRepository groupRepository;
    private final SubjectAssignmentSearchRepository subjectAssignmentSearchRepository;
    private final ConceptRepository conceptRepository;


    @Autowired
    public UserSubjectAssignmentService(UserSubjectAssignmentRepository userSubjectAssignmentRepository, UserRepository userRepository, SubjectTypeRepository subjectTypeRepository, ProgramRepository programRepository, GroupRepository groupRepository, SubjectAssignmentSearchRepository subjectAssignmentSearchRepository, ConceptRepository conceptRepository) {
        this.userSubjectAssignmentRepository = userSubjectAssignmentRepository;
        this.userRepository = userRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.programRepository = programRepository;
        this.groupRepository = groupRepository;
        this.subjectAssignmentSearchRepository = subjectAssignmentSearchRepository;
        this.conceptRepository = conceptRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        User user = UserContextHolder.getUserContext().getUser();
        return userSubjectAssignmentRepository.existsByUserAndIsVoidedTrueAndLastModifiedDateTimeGreaterThan(user, CHSEntity.toDate(lastModifiedDateTime));
    }

    public JsonObject getUserSubjectAssignmentMetadata() {
        JsonObject response = new JsonObject();
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        List<SubjectType> subjectTypes = subjectTypeRepository.findAllByIsVoidedFalseAndIsDirectlyAssignableTrue();
        List<ConceptContract> syncAttributes = new ArrayList<>();
        subjectTypes.forEach(st -> {
            if (st.getSyncRegistrationConcept1() != null) {
                addToSyncAttributes(st.getSyncRegistrationConcept1(), syncAttributes);
            }
            if (st.getSyncRegistrationConcept2() != null) {
                addToSyncAttributes(st.getSyncRegistrationConcept2(), syncAttributes);
            }
        });
        List<UserWebProjection> users = userRepository.findAllByOrganisationIdAndIsVoidedFalse(organisation.getId());
        List<GroupContract> groups = groupRepository.findAllByIsVoidedFalse().stream().map(GroupContract::fromEntity).collect(Collectors.toList());
        response.with("users", users)
                .with("subjectTypes", subjectTypes)
                .with("groups", groups)
                .with("syncAttributes", syncAttributes)
                .with("programs", programRepository.findAllByIsVoidedFalse());
        return response;
    }

    private void addToSyncAttributes(String st, List<ConceptContract> syncAttributes) {
        Concept concept = conceptRepository.findByUuid(st);
        syncAttributes.add(ConceptContract.create(concept));
    }

    @Transactional
    public LinkedHashMap<String, Object> searchSubjects(SubjectSearchRequest subjectSearchRequest) {
        List<Map<String, Object>> searchResults = subjectAssignmentSearchRepository.search(subjectSearchRequest);
        BigInteger totalCount = subjectAssignmentSearchRepository.getTotalCount(subjectSearchRequest);
        LinkedHashMap<String, Object> recordsMap = new LinkedHashMap<String, Object>();
        recordsMap.put("totalElements", totalCount);
        recordsMap.put("listOfRecords", searchResults);
        return recordsMap;
    }

}
