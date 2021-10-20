package org.avni.service;

import org.avni.domain.*;
import org.joda.time.DateTime;
import org.avni.dao.ChecklistDetailRepository;
import org.avni.dao.ChecklistItemRepository;
import org.avni.dao.OperatingIndividualScopeAwareRepository;
import org.avni.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class ChecklistItemService implements ScopeAwareService {
    private final ChecklistDetailRepository checklistDetailRepository;
    private final ChecklistItemRepository checklistItemRepository;

    @Autowired
    public ChecklistItemService(ChecklistDetailRepository checklistDetailRepository, ChecklistItemRepository checklistItemRepository) {
        this.checklistDetailRepository = checklistDetailRepository;
        this.checklistItemRepository = checklistItemRepository;
    }

    @Override
    public boolean isScopeEntityChanged(DateTime lastModifiedDateTime, String checklistDetailUuid) {
        ChecklistDetail checklistDetail = checklistDetailRepository.findByUuid(checklistDetailUuid);
        User user = UserContextHolder.getUserContext().getUser();
        return checklistDetail != null && isChanged(user, lastModifiedDateTime, checklistDetail.getId());
    }

    @Override
    public OperatingIndividualScopeAwareRepository repository() {
        return checklistItemRepository;
    }

    public Set<ChecklistItem> findChecklistItemsByIndividual(Individual individual) {
        return checklistItemRepository.findByChecklistProgramEnrolmentIndividual(individual);
    }
}
