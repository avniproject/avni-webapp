package org.openchs.web;

import com.amazonaws.services.cognitoidp.model.AWSCognitoIdentityProviderException;
import com.amazonaws.services.cognitoidp.model.UsernameExistsException;
import org.apache.commons.validator.routines.EmailValidator;
import org.openchs.dao.*;
import org.openchs.domain.OperatingIndividualScope;
import org.openchs.domain.User;
import org.openchs.domain.UserFacilityMapping;
import org.openchs.service.CognitoIdpService;
import org.openchs.service.UserService;
import org.openchs.web.request.UserContract;
import org.openchs.web.validation.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.persistence.criteria.Predicate;
import javax.transaction.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RepositoryRestController
//@RestController
public class UserController {
    private final CatchmentRepository catchmentRepository;
    private final Logger logger;
    private UserRepository userRepository;
    private UserFacilityMappingRepository userFacilityMappingRepository;
    private OrganisationRepository organisationRepository;
    private UserService userService;
    private CognitoIdpService cognitoService;
    private FacilityRepository facilityRepository;

    @Value("${openchs.userPhoneNumberPattern}")
    private String MOBILE_NUMBER_PATTERN;

    @Autowired
    public UserController(CatchmentRepository catchmentRepository,
                          UserRepository userRepository,
                          UserFacilityMappingRepository userFacilityMappingRepository,
                          OrganisationRepository organisationRepository,
                          UserService userService,
                          CognitoIdpService cognitoService,
                          FacilityRepository facilityRepository) {
        this.catchmentRepository = catchmentRepository;
        this.userRepository = userRepository;
        this.userFacilityMappingRepository = userFacilityMappingRepository;
        this.organisationRepository = organisationRepository;
        this.userService = userService;
        this.cognitoService = cognitoService;
        this.facilityRepository = facilityRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    private Boolean usernameExists(String name) {
        return (userRepository.findByUsername(name) != null);
    }

    private Map<String, String> generateJsonError(String errorMsg) {
        Map<String, String> errorMap = new HashMap<>();
        errorMap.put("message", errorMsg);
        return errorMap;
    }

    @RequestMapping(value = "/user", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity createUser(@RequestBody UserContract userContract) {
        try {
            if (usernameExists(userContract.getUsername()))
                throw new ValidationException(String.format("Username %s already exists", userContract.getUsername()));

            User user = new User();
            user.setUuid(UUID.randomUUID().toString());
            logger.info(String.format("Creating user with username '%s' and UUID '%s'", userContract.getUsername(), user.getUuid()));

            user.setUsername(userContract.getUsername());
            user = setUserAttributes(user, userContract);

            cognitoService.createUser(user);
            userService.save(user);

            logger.info(String.format("Saved new user '%s', UUID '%s'", userContract.getUsername(), user.getUuid()));
            return new ResponseEntity<>(user, HttpStatus.CREATED);
        } catch (ValidationException | UsernameExistsException ex) {
            logger.error(ex.getMessage());
            return ResponseEntity.badRequest().body(generateJsonError(ex.getMessage()));
        } catch (AWSCognitoIdentityProviderException ex) {
            logger.error(ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(generateJsonError(ex.getMessage()));
        }
    }

    @PutMapping(value = "/user/{id}")
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity updateUser(@RequestBody UserContract userContract, @PathVariable("id") Long id) {
        try {
            User user = userRepository.findByUsername(userContract.getUsername());
            if (user == null)
                return ResponseEntity.badRequest()
                        .body(String.format("User with username '%s' not found", userContract.getUsername()));

            user = setUserAttributes(user, userContract);

            cognitoService.updateUser(user);
            userService.save(user);

            logger.info(String.format("Saved user '%s', UUID '%s'", userContract.getUsername(), user.getUuid()));
            return new ResponseEntity<>(user, HttpStatus.CREATED);
        } catch (ValidationException ex) {
            logger.error(ex.getMessage());
            return ResponseEntity.badRequest().body(generateJsonError(ex.getMessage()));
        } catch (AWSCognitoIdentityProviderException ex) {
            logger.error(ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(generateJsonError(ex.getMessage()));
        }
    }

    private Boolean emailIsValid(String email) {
        return EmailValidator.getInstance().isValid(email);
    }

    private Boolean phoneNumberIsValid(String phoneNumber) {
        return phoneNumber.matches(MOBILE_NUMBER_PATTERN);
    }

    private User setUserAttributes(User user, UserContract userContract) {
        if (!emailIsValid(userContract.getEmail()))
            throw new ValidationException(String.format("Invalid email address %s", userContract.getEmail()));
        user.setEmail(userContract.getEmail());

        if (!phoneNumberIsValid(userContract.getPhoneNumber()))
            throw new ValidationException(String.format("Invalid phone number %s", userContract.getPhoneNumber()));
        user.setPhoneNumber(userContract.getPhoneNumber());

        user.setName(userContract.getName());
        user.setCatchment(catchmentRepository.findOne(userContract.getCatchmentId()));

        List<UserFacilityMapping> userFacilityMappings = userContract.getFacilities().stream().map(
                userFacilityMappingContract -> {
                    UserFacilityMapping mapping = userFacilityMappingRepository.findByUuid(userFacilityMappingContract.getUuid());
                    if (mapping == null) {
                        mapping = new UserFacilityMapping();
                        mapping.setUuid(userFacilityMappingContract.getUuid());
                    }
                    mapping.setFacility(facilityRepository.findByUuid(userFacilityMappingContract.getFacilityUUID()));
                    return mapping;
                }).collect(Collectors.toList());
        user.addUserFacilityMappings(userFacilityMappings);

        user.setOrgAdmin(userContract.isOrgAdmin());
        user.setAdmin(userContract.isAdmin());
        user.setOperatingIndividualScope(OperatingIndividualScope.valueOf(userContract.getOperatingIndividualScope()));
        user.setSettings(userContract.getSettings());

        User currentUser = userService.getCurrentUser();
        user.setOrganisationId(currentUser.getOrganisationId());
        user.setAuditInfo(currentUser);
        return user;
    }

    @RequestMapping(value = "/user/{id}", method = RequestMethod.DELETE)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity deleteUser(@PathVariable("id") Long id) {
        try {
            User user = userRepository.findOne(id);
            cognitoService.deleteUser(user);
            user.setVoided(true);
            user.setDisabledInCognito(true);
            userRepository.save(user);
            logger.info(String.format("Deleted user '%s', UUID '%s'", user.getUsername(), user.getUuid()));
            return new ResponseEntity<>(user, HttpStatus.CREATED);
        } catch (AWSCognitoIdentityProviderException ex) {
            logger.error(ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(generateJsonError(ex.getMessage()));
        }
    }

    @RequestMapping(value = "/user/{id}/disable", method = RequestMethod.PUT)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity disableUser(@PathVariable("id") Long id,
                                      @RequestParam(value = "disable", required = false, defaultValue = "false") boolean disable) {
        try {
            User user = userRepository.findOne(id);
            if (disable) {
                cognitoService.disableUser(user);
                user.setDisabledInCognito(true);
                userRepository.save(user);
                logger.info(String.format("Disabled user '%s', UUID '%s'", user.getUsername(), user.getUuid()));
            } else {
                if (user.isDisabledInCognito()) {
                    cognitoService.enableUser(user);
                    user.setDisabledInCognito(false);
                    userRepository.save(user);
                    logger.info(String.format("Enabled previously disabled user '%s', UUID '%s'", user.getUsername(), user.getUuid()));
                } else {
                    logger.info(String.format("User '%s', UUID '%s' already enabled", user.getUsername(), user.getUuid()));
                }
            }
            return new ResponseEntity<>(user, HttpStatus.CREATED);
        } catch (AWSCognitoIdentityProviderException ex) {
            logger.error(ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(generateJsonError(ex.getMessage()));
        }
    }

    @GetMapping(value = "/user/search/find")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    public Page<User> find(@RequestParam(value = "username", required = false) String username,
                           @RequestParam(value = "name", required = false) String name,
                           @RequestParam(value = "email", required = false) String email,
                           @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
                           Pageable pageable) {
        Long organisationId = userService.getCurrentUser().getOrganisationId();
        return userRepository.findAll((root, query, builder) -> {
            Predicate predicate = builder.equal(root.get("organisationId"), organisationId);
            if (username != null) {
                predicate = builder.and(predicate, builder.like(builder.upper(root.get("username")), "%" + username.toUpperCase() + "%"));
            }
            if (name != null) {
                predicate = builder.and(predicate, builder.like(builder.upper(root.get("name")), "%" + name.toUpperCase() + "%"));
            }
            if (email != null) {
                predicate = builder.and(predicate, builder.like(builder.upper(root.get("email")), "%" + email.toUpperCase() + "%"));
            }
            if (phoneNumber != null) {
                predicate = builder.and(predicate, builder.like(root.get("phoneNumber"), "%" + phoneNumber + "%"));
            }
            return predicate;
        }, pageable);
    }
}
