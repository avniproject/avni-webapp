package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.*;
import org.openchs.domain.*;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.service.UserService;
import org.openchs.web.request.UserContract;
import org.openchs.web.request.UserInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
public class UserInfoController {
    private final CatchmentRepository catchmentRepository;
    private final Logger logger;
    private UserRepository userRepository;
    private UserFacilityMappingRepository userFacilityMappingRepository;
    private OrganisationRepository organisationRepository;
    private UserService userService;
    private FacilityRepository facilityRepository;

    @Autowired
    public UserInfoController(CatchmentRepository catchmentRepository, UserRepository userRepository, UserFacilityMappingRepository userFacilityMappingRepository, OrganisationRepository organisationRepository, UserService userService, FacilityRepository facilityRepository) {
        this.catchmentRepository = catchmentRepository;
        this.userRepository = userRepository;
        this.userFacilityMappingRepository = userFacilityMappingRepository;
        this.organisationRepository = organisationRepository;
        this.userService = userService;
        this.facilityRepository = facilityRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/userInfo", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin', 'organisation_admin')")
    public ResponseEntity<UserInfo> getUserInfo(@RequestParam(value = "catchmentId", required = true) Integer catchmentId) {
        Catchment catchment = this.catchmentRepository.findOne(Long.valueOf(catchmentId));
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();

        if (catchment == null) {
            logger.info(String.format("Catchment not found for ID: %s", catchmentId));
            return new ResponseEntity<>(new UserInfo(null, null), HttpStatus.NOT_FOUND);
        }
        if (organisation == null) {
            logger.info(String.format("Organisation not found for catchment ID: %s", catchmentId));
            return new ResponseEntity<>(new UserInfo(null, null), HttpStatus.NOT_FOUND);
        }

        //TODO catchmentType in userInfo is deprecated and should be removed completely in a month's time.
        return new ResponseEntity<>(new UserInfo(catchment.getType(), organisation.getName()), HttpStatus.OK);
    }

    @RequestMapping(value = "/users", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public void save(@RequestBody UserContract[] userContracts) {
        Arrays.stream(userContracts).forEach(userContract -> {
            logger.info(String.format("Saving user with UUID/Name %s/%s", userContract.getUuid(), userContract.getName()));
            User user = userContract.getUuid() == null ? userRepository.findByName(userContract.getName()) : userRepository.findByUuid(userContract.getUuid());
            if (user == null) {
                user = new User();
                user.setUuid(userContract.getUuid() == null ? UUID.randomUUID().toString() : userContract.getUuid());
                user.setName(userContract.getName());
            }
            Catchment catchment = userContract.getCatchmentUUID() == null ? catchmentRepository.findOne(userContract.getCatchmentId()) : catchmentRepository.findByUuid(userContract.getCatchmentUUID());
            user.setCatchment(catchment);

            List<UserFacilityMapping> userFacilityMappings = userContract.getFacilities().stream().map(userFacilityMappingContract -> {
                UserFacilityMapping mapping = userFacilityMappingRepository.findByUuid(userFacilityMappingContract.getUuid());
                if (mapping == null) {
                    mapping = new UserFacilityMapping();
                    mapping.setUuid(userFacilityMappingContract.getUuid());
                }
                mapping.setFacility(facilityRepository.findByUuid(userFacilityMappingContract.getFacilityUUID()));
                return mapping;
            }).collect(Collectors.toList());
            user.addUserFacilityMappings(userFacilityMappings);
            Long organisationId = getOrganisationId(userContract);
            user.setOrganisationId(organisationId);
            user.setOrgAdmin(userContract.isOrgAdmin());
            user.setAdmin(userContract.isAdmin());
            user.setOperatingIndividualScope(OperatingIndividualScope.valueOf(userContract.getOperatingIndividualScope()));

            setAuditInfo(user);

            userRepository.save(user);
            logger.info(String.format("Saved User with UUID %s", userContract.getUuid()));
        });
    }

    private Long getOrganisationId(UserContract userContract) {
        String uuid = userContract.getOrganisationUUID();
        Long id = userContract.getOrganisationId();
        if (id == null && uuid == null) {
            throw new RuntimeException("Not found: Organisation{uuid=null, id=null}");
        }
        if (id != null) {
            return id;
        }
        Organisation organisation = organisationRepository.findByUuid(uuid);
        if (organisation == null) {
            throw new RuntimeException(String.format("Not found: Organisation{uuid='%s'}", uuid));
        }
        return organisation.getId();
    }

    private void setAuditInfo(User user) {
        User currentUser = userService.getCurrentUser();
        if (user.getCreatedBy() == null) {
            user.setCreatedBy(currentUser);
            user.setCreatedDateTime(new DateTime());
        }
        user.setLastModifiedBy(currentUser);
        user.setLastModifiedDateTime(new DateTime());
    }
}
