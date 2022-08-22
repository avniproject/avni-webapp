package org.avni.service.application;

import org.avni.common.EntityHelper;
import org.avni.dao.application.MenuItemRepository;
import org.avni.dao.task.TaskTypeRepository;
import org.avni.domain.task.TaskType;
import org.avni.domain.task.TaskTypeName;
import org.avni.service.NonScopeAwareService;
import org.avni.web.request.webapp.task.TaskTypeContract;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuItemService implements NonScopeAwareService {
    private final MenuItemRepository menuItemRepository;

    @Autowired
    public MenuItemService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return menuItemRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
