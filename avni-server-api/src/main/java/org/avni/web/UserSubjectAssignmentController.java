package org.avni.web;

import org.avni.dao.UserSubjectAssignmentRepository;
import org.avni.domain.CHSEntity;
import org.avni.domain.User;
import org.avni.domain.UserSubjectAssignment;
import org.avni.framework.security.UserContextHolder;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserSubjectAssignmentController extends AbstractController<UserSubjectAssignment> implements RestControllerResourceProcessor<UserSubjectAssignment> {

    private final UserSubjectAssignmentRepository userSubjectAssignmentRepository;

    @Autowired
    public UserSubjectAssignmentController(UserSubjectAssignmentRepository userSubjectAssignmentRepository) {
        this.userSubjectAssignmentRepository = userSubjectAssignmentRepository;
    }

    @RequestMapping(value = "/userSubjectAssignment", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public PagedResources<Resource<UserSubjectAssignment>> getTasks(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        User user = UserContextHolder.getUserContext().getUser();
        return wrap(userSubjectAssignmentRepository.findByUserAndIsVoidedTrueAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(user, CHSEntity.toDate(lastModifiedDateTime), CHSEntity.toDate(now), pageable));
    }
}
