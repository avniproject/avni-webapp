package org.avni.server.exporter;


import org.avni.server.dao.AvniJobRepository;
import org.avni.server.dao.JobStatus;
import org.avni.server.domain.User;
import org.avni.server.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import javax.validation.constraints.NotNull;

@Service
public class ExportJobService {
    private AvniJobRepository avniJobRepository;

    @Autowired
    public ExportJobService(AvniJobRepository avniJobRepository) {
        this.avniJobRepository = avniJobRepository;
    }

    @Transactional
    public Page<JobStatus> getAll(@NotNull Pageable pageable) {
        User user = UserContextHolder.getUserContext().getUser();
        String jobFilterCondition = " and subjectTypeUUID <> '' ";
        return avniJobRepository.getJobStatuses(user, jobFilterCondition, pageable);
    }
}
