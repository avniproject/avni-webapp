package org.openchs.web;


import org.joda.time.DateTime;
import org.openchs.dao.UserGroupRepository;
import org.openchs.domain.User;
import org.openchs.domain.UserGroup;
import org.openchs.framework.security.UserContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserGroupController extends AbstractController<UserGroup> implements RestControllerResourceProcessor<UserGroup> {
    private UserGroupRepository userGroupRepository;


    @Autowired
    public UserGroupController(UserGroupRepository userGroupRepository) {
        this.userGroupRepository = userGroupRepository;
    }


    @RequestMapping(value = "/myGroups/search/lastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<UserGroup>> get(@RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
                                                   @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
                                                   Pageable pageable) {
        User user = UserContextHolder.getUserContext().getUser();
        return wrap(userGroupRepository.findByUserIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(user.getId(), lastModifiedDateTime, now, pageable));
    }

}
