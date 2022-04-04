package org.avni.service;

import org.avni.dao.*;
import org.avni.domain.*;
import org.joda.time.DateTime;
import org.avni.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class ChecklistItemService implements ScopeAwareService {
    private final ChecklistDetailRepository checklistDetailRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final ChecklistRepository checklistRepository;

    @Autowired
    public ChecklistItemService(ChecklistDetailRepository checklistDetailRepository, ChecklistItemRepository checklistItemRepository, ChecklistRepository checklistRepository) {
        this.checklistDetailRepository = checklistDetailRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.checklistRepository = checklistRepository;
    }

    @Override
    public boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String checklistDetailUuid) {
        ChecklistDetail checklistDetail = checklistDetailRepository.findByUuid(checklistDetailUuid);
        Checklist checklist = checklistRepository.findFirstByChecklistDetail(checklistDetail);
        User user = UserContextHolder.getUserContext().getUser();
        return checklistDetail != null &&
                checklist != null &&
                isChanged(user, lastModifiedDateTime, checklistDetail.getId(), checklist.getProgramEnrolment().getIndividual().getSubjectType(), SyncParameters.SyncEntityName.ChecklistItem);
    }

    @Override
    public OperatingIndividualScopeAwareRepository repository() {
        return checklistItemRepository;
    }

    public Set<ChecklistItem> findChecklistItemsByIndividual(Individual individual) {
        return checklistItemRepository.findByChecklistProgramEnrolmentIndividual(individual);
    }
}
