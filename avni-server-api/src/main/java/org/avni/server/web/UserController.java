package org.avni.server.web;

import com.amazonaws.services.cognitoidp.model.AWSCognitoIdentityProviderException;
import com.amazonaws.services.cognitoidp.model.UsernameExistsException;
import org.apache.commons.validator.routines.EmailValidator;
import org.avni.server.dao.*;
import org.avni.server.domain.*;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.projection.UserWebProjection;
import org.avni.server.service.*;
import org.avni.server.web.request.UserContract;
import org.avni.server.web.request.syncAttribute.UserSyncSettings;
import org.avni.server.web.validation.ValidationException;
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

import javax.persistence.EntityNotFoundException;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.transaction.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@RepositoryRestController
//@RestController
public class UserController {
    private final CatchmentRepository catchmentRepository;
    private final Logger logger;
    private final UserRepository userRepository;
    private final OrganisationRepository organisationRepository;
    private final UserService userService;
    private final IdpService idpService;
    private final AccountAdminService accountAdminService;
    private final AccountRepository accountRepository;
    private final AccountAdminRepository accountAdminRepository;
    private final ResetSyncService resetSyncService;
    private final SubjectTypeRepository subjectTypeRepository;
    private final OrganisationConfigService organisationConfigService;

    @Value("${avni.userPhoneNumberPattern}")
    private String MOBILE_NUMBER_PATTERN;

    @Autowired
    public UserController(CatchmentRepository catchmentRepository,
                          UserRepository userRepository,
                          OrganisationRepository organisationRepository,
                          UserService userService,
                          IdpService idpService,
                          AccountAdminService accountAdminService, AccountRepository accountRepository,
                          AccountAdminRepository accountAdminRepository, ResetSyncService resetSyncService,
                          SubjectTypeRepository subjectTypeRepository,
                          OrganisationConfigService organisationConfigService) {
        this.catchmentRepository = catchmentRepository;
        this.userRepository = userRepository;
        this.organisationRepository = organisationRepository;
        this.userService = userService;
        this.idpService = idpService;
        this.accountAdminService = accountAdminService;
        this.accountRepository = accountRepository;
        this.accountAdminRepository = accountAdminRepository;
        this.resetSyncService = resetSyncService;
        this.subjectTypeRepository = subjectTypeRepository;
        this.organisationConfigService = organisationConfigService;
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

    @RequestMapping(value = {"/user", "/user/accountOrgAdmin"}, method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity createUser(@RequestBody UserContract userContract) throws Exception {
        try {
            if (usernameExists(userContract.getUsername()))
                throw new ValidationException(String.format("Username %s already exists", userContract.getUsername()));

            User user = new User();
            user.setUuid(UUID.randomUUID().toString());
            logger.info(String.format("Creating user with username '%s' and UUID '%s'", userContract.getUsername(), user.getUuid()));

            user.setUsername(userContract.getUsername());
            user = setUserAttributes(user, userContract);

            Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
            OrganisationConfig organisationConfig = organisationConfigService.getOrganisationConfig(organisation);
            idpService.createUserWithPassword(user, userContract.getPassword(), organisationConfig);
            userService.save(user);
            accountAdminService.createAccountAdmins(user, userContract.getAccountIds());
            userService.addToDefaultUserGroup(user);
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

    @GetMapping(value = "/user/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    public UserContract getUser(@PathVariable("id") Long id) {
        User user = userRepository.findOne(id);
        if (user == null) {
            throw new EntityNotFoundException(String.format("User not found with id %d", id));
        }
        UserContract userContract = UserContract.fromEntity(user);
        userContract.setSyncSettings(UserSyncSettings.fromUserSyncSettings(user.getSyncSettings(), subjectTypeRepository));
        return userContract;
    }

    @PutMapping(value = {"/user/{id}", "/user/accountOrgAdmin/{id}"})
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity updateUser(@RequestBody UserContract userContract, @PathVariable("id") Long id) throws Exception {
        try {
            User user = userRepository.findByUsername(userContract.getUsername());
            if (user == null)
                return ResponseEntity.badRequest()
                        .body(String.format("User with username '%s' not found", userContract.getUsername()));
            resetSyncService.recordSyncAttributeValueChangeForUser(user, userContract, UserSyncSettings.fromUserSyncWebJSON(userContract.getSyncSettings(), subjectTypeRepository));
            user = setUserAttributes(user, userContract);

            idpService.updateUser(user);
            userService.save(user);
            accountAdminService.createAccountAdmins(user, userContract.getAccountIds());
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
        if(userContract.getCatchmentId()!=null) {
            user.setCatchment(catchmentRepository.findOne(userContract.getCatchmentId()));
        }

        user.setOrgAdmin(userContract.isOrgAdmin());
        user.setOperatingIndividualScope(OperatingIndividualScope.valueOf(userContract.getOperatingIndividualScope()));
        user.setSettings(userContract.getSettings());
        user.setSyncSettings(UserSyncSettings.fromUserSyncWebJSON(userContract.getSyncSettings(), subjectTypeRepository));
        User currentUser = userService.getCurrentUser();
        Long organisationId = null;
        if (!userContract.isAdmin()) {
            organisationId = userContract.getOrganisationId() == null ? UserContextHolder.getUserContext().getOrganisationId() : userContract.getOrganisationId();
        }
        user.setOrganisationId(organisationId);
        user.setAuditInfo(currentUser);
        return user;
    }

    @RequestMapping(value = "/user/{id}", method = RequestMethod.DELETE)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity deleteUser(@PathVariable("id") Long id) {
        try {
            User user = userRepository.findOne(id);
            idpService.deleteUser(user);
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

    @RequestMapping(value = {"/user/{id}/disable", "/user/accountOrgAdmin/{id}/disable"}, method = RequestMethod.PUT)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity disableUser(@PathVariable("id") Long id,
                                      @RequestParam(value = "disable", required = false, defaultValue = "false") boolean disable) {
        try {
            User user = userRepository.findOne(id);
            if (disable) {
                idpService.disableUser(user);
                user.setDisabledInCognito(true);
                userRepository.save(user);
                logger.info(String.format("Disabled user '%s', UUID '%s'", user.getUsername(), user.getUuid()));
            } else {
                if (user.isDisabledInCognito()) {
                    idpService.enableUser(user);
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

    @RequestMapping(value = {"/user/{id}/resetPassword"}, method = RequestMethod.PUT)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    public ResponseEntity resetPassword(@PathVariable("id") Long id, @RequestParam() String password) {
        try {
            User user = userRepository.findOne(id);
            idpService.resetPassword(user, password);
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
        Long organisationId = UserContextHolder.getUserContext().getOrganisation().getId();
        return userRepository.findAll((root, query, builder) -> {
            Predicate predicate = builder.equal(root.get("organisationId"), organisationId);
            return applyUserPredicates(username, name, email, phoneNumber, root, builder, predicate);
        }, pageable);
    }

    private Predicate applyUserPredicates(@RequestParam(value = "username", required = false) String username, @RequestParam(value = "name", required = false) String name, @RequestParam(value = "email", required = false) String email, @RequestParam(value = "phoneNumber", required = false) String phoneNumber, Root<User> root, CriteriaBuilder builder, Predicate predicate) {
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
    }

    @GetMapping(value = "/user/accountOrgAdmin/search/find")
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    @ResponseBody
    public Page<UserContract> findOrgAdmin(@RequestParam(value = "username", required = false) String username,
                                           @RequestParam(value = "name", required = false) String name,
                                           @RequestParam(value = "email", required = false) String email,
                                           @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
                                           Pageable pageable) {
        User user = UserContextHolder.getUserContext().getUser();
        List<Long> userAccountIds = getOwnedAccountIds(user);
        List<Long> organisationIds = getOwnedOrganisationIds(user);
        List<Long> queryParam = organisationIds.isEmpty() ? null : organisationIds;
        Page<UserContract> userContracts = userRepository.findAccountAndOrgAdmins(username, name, email, phoneNumber, userAccountIds, queryParam, pageable)
                .map(UserContract::fromEntity);
        userContracts.forEach(this::setAccountIds);
        return userContracts;
    }

    @GetMapping(value = "/user/accountOrgAdmin/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    @ResponseBody
    public UserContract getOne(@PathVariable("id") Long id) {
        User user = UserContextHolder.getUserContext().getUser();
        List<Long> userAccountIds = getOwnedAccountIds(user);
        List<Long> organisationIds = getOwnedOrganisationIds(user);
        List<Long> queryParam = organisationIds.isEmpty() ? null : organisationIds;
        UserContract userContract = UserContract.fromEntity(userRepository.getOne(id, userAccountIds, queryParam));
        setAccountIds(userContract);
        return userContract;
    }

    @GetMapping(value = "/user/search/findAll")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    public List<UserWebProjection> getAll() {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        return userRepository.findAllByOrganisationIdAndIsVoidedFalse(organisation.getId());
    }

    private List<Long> getOwnedAccountIds(User user) {
        return accountRepository.findAllByAccountAdmin_User_Id(user.getId()).stream().map(Account::getId).collect(Collectors.toList());
    }

    private void setAccountIds(UserContract uc) {
        List<Long> accountIds = accountRepository.findAllByAccountAdmin_User_Id(uc.getId()).stream().map(Account::getId).collect(Collectors.toList());
        boolean isAdmin = accountAdminRepository.findByUser_Id(uc.getId()).size() > 0;
        List<String> roles = new ArrayList<>();
        if (isAdmin) {
            roles.add(User.ADMIN);
            if (uc.isOrgAdmin()) roles.add(User.ORGANISATION_ADMIN);
        } else {
            roles.addAll(Arrays.asList(uc.getRoles()));
        }
        uc.setAccountIds(accountIds);
        uc.setAdmin(isAdmin);
        uc.setRoles(roles.toArray(new String[0]));
    }

    private List<Long> getOwnedOrganisationIds(User user) {
        return organisationRepository.findByAccount_AccountAdmin_User_Id(user.getId()).stream()
                .map(Organisation::getId).collect(Collectors.toList());
    }
}
