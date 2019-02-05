package org.openchs.web;

import org.openchs.dao.SubjectTypeRepository;
import org.openchs.domain.Program;
import org.openchs.domain.SubjectType;
import org.openchs.web.request.ProgramRequest;
import org.openchs.web.request.SubjectTypeContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class SubjectTypeController {
    private final Logger logger;
    private SubjectTypeRepository subjectTypeRepository;

    @Autowired
    public SubjectTypeController(SubjectTypeRepository subjectTypeRepository) {
        this.subjectTypeRepository = subjectTypeRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/subjectTypes", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public void save(@RequestBody List<SubjectTypeContract> subjectTypeRequests) {
        subjectTypeRequests.forEach(subjectTypeRequest -> {
            logger.info(String.format("Creating subjectType: %s", subjectTypeRequest.toString()));
            SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeRequest.getUuid());
            if (subjectType == null) {
                subjectType = createSubjectType(subjectTypeRequest);
            }

            subjectType.setName(subjectTypeRequest.getName());

            subjectTypeRepository.save(subjectType);
        });
    }

    private SubjectType createSubjectType(SubjectTypeContract programRequest) {
        SubjectType subjectType = new SubjectType();
        subjectType.setUuid(programRequest.getUuid());
        return subjectType;
    }
}