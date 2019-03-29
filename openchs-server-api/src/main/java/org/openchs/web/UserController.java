package org.openchs.web;

import com.amazonaws.services.cognitoidp.model.AWSCognitoIdentityProviderException;
import com.amazonaws.services.cognitoidp.model.UsernameExistsException;
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
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.apache.commons.validator.routines.EmailValidator;

import javax.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RepositoryRestController
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
        return (userRepository.findByName(name) != null);
    }

    @RequestMapping(value = "/user", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity createUser(@RequestBody UserContract userContract) {
        try {
            if (usernameExists(userContract.getName()))
                throw new ValidationException(String.format("Username %s already exists", userContract.getName()));

            User user = new User();
            user.setUuid(UUID.randomUUID().toString());
            logger.info(String.format("Creating user with username '%s' and UUID '%s'", userContract.getName(), user.getUuid()));

            user.setName(userContract.getName());
            user = setUserAttributes(user, userContract);

            cognitoService.createUser(user);
            userService.save(user);

            logger.info(String.format("Saved new user '%s', UUID '%s'", userContract.getName(), user.getUuid()));
            return new ResponseEntity<>(user, HttpStatus.CREATED);
        }
        catch (ValidationException | UsernameExistsException ex) {
            logger.error(ex.getMessage());
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
        catch (AWSCognitoIdentityProviderException ex) {
            logger.error(ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
        }
    }

    @PutMapping(value = "/user/{userId}")
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity updateUser(@RequestBody UserContract userContract, @PathVariable Long userId) {
        try {
            User user = userRepository.findByName(userContract.getName());
            if (user == null)
                return ResponseEntity.badRequest()
                        .body(String.format("User with username '%s' not found", userContract.getName()));

            user = setUserAttributes(user, userContract);

            cognitoService.updateUser(user);
            userService.save(user);

            logger.info(String.format("Saved user '%s', UUID '%s'", userContract.getName(), user.getUuid()));
            return new ResponseEntity<>(user, HttpStatus.CREATED);
        }
        catch (ValidationException ex) {
            logger.error(ex.getMessage());
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
        catch (AWSCognitoIdentityProviderException ex) {
            logger.error(ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
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
}
