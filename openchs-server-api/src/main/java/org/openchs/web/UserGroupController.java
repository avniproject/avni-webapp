package org.openchs.web;


import org.joda.time.DateTime;
import org.openchs.dao.GroupRepository;
import org.openchs.dao.UserGroupRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.Group;
import org.openchs.domain.User;
import org.openchs.domain.UserGroup;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.UserGroupContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class UserGroupController extends AbstractController<UserGroup> implements RestControllerResourceProcessor<UserGroup> {
    private UserGroupRepository userGroupRepository;
    private UserRepository userRepository;
    private GroupRepository groupRepository;


    @Autowired
    public UserGroupController(UserGroupRepository userGroupRepository, UserRepository userRepository, GroupRepository groupRepository) {
        this.userGroupRepository = userGroupRepository;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
    }


    @RequestMapping(value = "/myGroups/search/lastModified", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public PagedResources<Resource<UserGroup>> get(@RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
                                                   @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
                                                   Pageable pageable) {
        User user = UserContextHolder.getUserContext().getUser();
        return wrap(userGroupRepository.findByUserIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(user.getId(), lastModifiedDateTime, now, pageable));
    }

    @RequestMapping(value = "/groups/{id}/users", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public List<UserGroupContract> getById(@PathVariable("id") Long id) {
        return userGroupRepository.findByGroup_Id(id).stream()
                .map(UserGroupContract::fromEntity)
                .collect(Collectors.toList());
    }

    @RequestMapping(value = "/userGroups", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public List<UserGroupContract> getByOrganisationId() {
        return userGroupRepository.findByOrganisationId(UserContextHolder.getUserContext().getOrganisationId()).stream()
                .map(UserGroupContract::fromEntity)
                .collect(Collectors.toList());
    }

    @RequestMapping(value = "/userGroup", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public ResponseEntity addUsersToGroup(@RequestBody List<UserGroupContract> request) {
        List<UserGroup> usersToBeAdded = new ArrayList<>();

        for (UserGroupContract userGroupContract : request) {
            User user = userRepository.findOne(userGroupContract.getUserId());
            Group group = groupRepository.findOne(userGroupContract.getGroupId());
            if (user == null || group == null) {
                return ResponseEntity.badRequest().body(String.format("Invalid user id %d or group id %d", userGroupContract.getUserId(), userGroupContract.getGroupId()));
            }

            UserGroup userGroup = new UserGroup();
            userGroup.setUser(user);
            userGroup.setGroup(group);
            userGroup.assignUUID();
            userGroup.setOrganisationId(UserContextHolder.getUserContext().getOrganisationId());
            usersToBeAdded.add(userGroup);
        }

        return ResponseEntity.ok(userGroupRepository.saveAll(usersToBeAdded));
    }

    @RequestMapping(value = "/userGroup/{id}", method = RequestMethod.DELETE)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public ResponseEntity removeUserFromGroup(@PathVariable("id") Long id) {
        UserGroup userGroup = userGroupRepository.findOne(id);
        if (userGroup == null)
            return ResponseEntity.badRequest().body(String.format("UserGroup with id '%d' not found", id));

        userGroupRepository.delete(userGroup);
        return new ResponseEntity<>(UserGroupContract.fromEntity(userGroup), HttpStatus.OK);
    }
}
