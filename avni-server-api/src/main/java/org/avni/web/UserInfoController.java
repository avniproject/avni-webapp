package org.avni.web;

import org.joda.time.DateTime;
import org.avni.dao.*;
import org.avni.domain.*;
import org.avni.framework.security.UserContextHolder;
import org.avni.service.CognitoIdpService;
import org.avni.service.UserService;
import org.avni.web.request.UserBulkUploadContract;
import org.avni.web.request.UserInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageImpl;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import org.joda.time.DateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
public class UserInfoController implements RestControllerResourceProcessor<UserInfo> {
    private final CatchmentRepository catchmentRepository;
    private final Logger logger;
    private UserRepository userRepository;
    private UserFacilityMappingRepository userFacilityMappingRepository;
    private OrganisationRepository organisationRepository;
    private UserService userService;
    private FacilityRepository facilityRepository;
    private CognitoIdpService cognitoService;

    @Autowired
    public UserInfoController(CatchmentRepository catchmentRepository, UserRepository userRepository, UserFacilityMappingRepository userFacilityMappingRepository, OrganisationRepository organisationRepository, UserService userService, FacilityRepository facilityRepository, CognitoIdpService cognitoService) {
        this.catchmentRepository = catchmentRepository;
        this.userRepository = userRepository;
        this.userFacilityMappingRepository = userFacilityMappingRepository;
        this.organisationRepository = organisationRepository;
        this.userService = userService;
        this.facilityRepository = facilityRepository;
        this.cognitoService = cognitoService;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/userInfo", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    public ResponseEntity<UserInfo> getUserInfo() {
        UserContext userContext = UserContextHolder.getUserContext();
        User user = userContext.getUser();
        Organisation organisation = userContext.getOrganisation();

        if (organisation == null && !user.isAdmin()) {
            logger.info(String.format("Organisation not found for user ID: %s", user.getId()));
            return new ResponseEntity<>(new UserInfo(), HttpStatus.NOT_FOUND);
        }
        if (user.isAdmin() && organisation == null) {
            organisation = new Organisation();
        }
        String catchmentName = user.getCatchment() == null ? null : user.getCatchment().getName();
        String usernameSuffix = organisation.getUsernameSuffix() != null
                ? organisation.getUsernameSuffix() : organisation.getDbUser();
        UserInfo userInfo = new UserInfo(
                user.getUsername(),
                organisation.getName(),
                organisation.getId(),
                usernameSuffix,
                user.getRoles(),
                user.getSettings(),
                user.getName(),
                catchmentName);
        return new ResponseEntity<>(userInfo, HttpStatus.OK);
    }

    /**
     * @deprecated as of release 2.9, replaced by {@link #getMyProfile()}
     * @return
     */
    @Deprecated
    @RequestMapping(value = "/me", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    public ResponseEntity<UserInfo> getMyProfileOld() {
        return getUserInfo();
    }

    @RequestMapping(value = "/v2/me", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    public PagedResources<Resource<UserInfo>> getMyProfile() {
        UserContext userContext = UserContextHolder.getUserContext();
        User user = userContext.getUser();
        Organisation organisation = userContext.getOrganisation();
        String usernameSuffix = organisation.getUsernameSuffix() != null
                ? organisation.getUsernameSuffix() : organisation.getDbUser();
        String catchmentName = user.getCatchment() == null ? null : user.getCatchment().getName();
        UserInfo userInfo = new UserInfo(user.getUsername(),
                organisation.getName(),
                organisation.getId(),
                usernameSuffix,
                user.getRoles(),
                user.getSettings(),
                user.getName(),
                catchmentName);
        return wrap(new PageImpl<>(Arrays.asList(userInfo)));
    }

    @RequestMapping(value = "/me", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public void saveMyProfile(@RequestBody UserInfo userInfo) {
        User user = userService.getCurrentUser();
        user.setSettings(userInfo.getSettings());
        user.setLastModifiedBy(user);
        user.setLastModifiedDateTime(DateTime.now());
        userRepository.save(user);
    }

    @RequestMapping(value = "/users", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public void save(@RequestBody UserBulkUploadContract[] userContracts) {
        Arrays.stream(userContracts).forEach(userContract -> {
            logger.info(String.format("Saving user with UUID/Name %s/%s", userContract.getUuid(), userContract.getName()));
            User user = userContract.getUuid() == null ? userRepository.findByUsername(userContract.getName()) : userRepository.findByUuid(userContract.getUuid());
            boolean newUser = false;
            if (user == null) {
                user = new User();
                user.setUuid(userContract.getUuid() == null ? UUID.randomUUID().toString() : userContract.getUuid());
                user.setUsername(userContract.getName());
                newUser = true;
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
            user.setOperatingIndividualScope(OperatingIndividualScope.valueOf(userContract.getOperatingIndividualScope()));
            user.setSettings(userContract.getSettings());
            user.setPhoneNumber(userContract.getPhoneNumber());
            user.setEmail(userContract.getEmail());
            user.setAuditInfo(userService.getCurrentUser());
            User savedUser = userService.save(user);
            if (newUser) userService.addToDefaultUserGroup(user);
            logger.info(String.format("Saved User with UUID %s", userContract.getUuid()));
            cognitoService.createUserIfNotExists(savedUser);
        });
    }

    private Long getOrganisationId(UserBulkUploadContract userContract) {
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

}
