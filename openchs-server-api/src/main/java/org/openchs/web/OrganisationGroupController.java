package org.openchs.web;


import org.openchs.dao.AccountRepository;
import org.openchs.dao.OrganisationGroupRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.Organisation;
import org.openchs.domain.OrganisationGroup;
import org.openchs.domain.OrganisationGroupOrganisation;
import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.OrganisationGroupContract;
import org.openchs.web.validation.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.HashSet;
import java.util.Set;

@RestController
public class OrganisationGroupController implements RestControllerResourceProcessor<OrganisationGroup> {

    private final Logger logger;
    private OrganisationGroupRepository organisationGroupRepository;
    private OrganisationRepository organisationRepository;
    private AccountRepository accountRepository;

    public OrganisationGroupController(OrganisationGroupRepository organisationGroupRepository,
                                       OrganisationRepository organisationRepository,
                                       AccountRepository accountRepository) {
        this.organisationGroupRepository = organisationGroupRepository;
        this.organisationRepository = organisationRepository;
        this.accountRepository = accountRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/organisationGroup", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public ResponseEntity save(@RequestBody OrganisationGroupContract request) throws Exception {
        if (organisationGroupRepository.findByName(request.getName()) != null) {
            throw new ValidationException(String.format("Organisation group %s already exists", request.getName()));
        }
        String tempPassword = "password";
        organisationRepository.createDBUser(request.getDbUser(), tempPassword);
        OrganisationGroup organisationGroup = new OrganisationGroup();
        organisationGroup.setName(request.getName());
        organisationGroup.setDbUser(request.getDbUser());
        organisationGroup.setAccount(accountRepository.findOne(request.getAccountId()));
        addOrganisationGroupOrganisations(request, organisationGroup, new HashSet<>());
        logger.info("Saving organisation group {}", request.getName());
        organisationGroupRepository.save(organisationGroup);
        return new ResponseEntity<>(organisationGroup, HttpStatus.CREATED);
    }

    @RequestMapping(value = "/organisationGroup/{id}", method = RequestMethod.PUT)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public ResponseEntity<?> updateOrganisationGroup(@PathVariable("id") Long id, @RequestBody OrganisationGroupContract request) throws Exception {
        User user = UserContextHolder.getUserContext().getUser();
        OrganisationGroup organisationGroup = organisationGroupRepository.findByIdAndAccount_AccountAdmin_User_Id(id, user.getId());;
        //disable changing dbUser
        organisationGroup.setName(request.getName());
        organisationGroup.setAccount(accountRepository.findOne(request.getAccountId()));
        addOrganisationGroupOrganisations(request, organisationGroup, new HashSet<>());
        organisationGroupRepository.save(organisationGroup);
        return new ResponseEntity<>(organisationGroup, HttpStatus.OK);
    }

    @RequestMapping(value = "/organisationGroup", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public Page<OrganisationGroupContract> get(Pageable pageable) {
        User user = UserContextHolder.getUserContext().getUser();
        Page<OrganisationGroup> organisationGroups = organisationGroupRepository.findByAccount_AccountAdmin_User_Id(user.getId(), pageable);
        return organisationGroups.map(OrganisationGroupContract::fromEntity);
    }

    @RequestMapping(value = "/organisationGroup/{id}", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public OrganisationGroupContract getById(@PathVariable Long id) {
        User user = UserContextHolder.getUserContext().getUser();
        OrganisationGroup organisationGroup = organisationGroupRepository.findByIdAndAccount_AccountAdmin_User_Id(id, user.getId());
        return OrganisationGroupContract.fromEntity(organisationGroup);
    }

    @RequestMapping(value = "/organisationGroup/{id}", method = RequestMethod.DELETE)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public ResponseEntity<?> deleteById(@PathVariable Long id) {
        User user = UserContextHolder.getUserContext().getUser();
        OrganisationGroup organisationGroup = organisationGroupRepository.findByIdAndAccount_AccountAdmin_User_Id(id, user.getId());
        if (organisationGroup == null) {
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError(String.format("organisationGroup with id %d not found", id)));
        }
        logger.info("Deleting organisation group {}", organisationGroup.getName());
        organisationGroupRepository.delete(organisationGroup);
        return new ResponseEntity<>(OrganisationGroupContract.fromEntity(organisationGroup), HttpStatus.OK);
    }

    private void addOrganisationGroupOrganisations(@RequestBody OrganisationGroupContract request, OrganisationGroup organisationGroup, Set<OrganisationGroupOrganisation> organisationGroupOrganisations) throws Exception {
        for (Long orgId : request.getOrganisationIds()) {
            Organisation organisation = organisationRepository.findOne(orgId);
            if (organisation == null) {
                throw new Exception(String.format("Organisation id %d not found", orgId));
            }
            OrganisationGroupOrganisation organisationGroupOrganisation = new OrganisationGroupOrganisation();
            organisationGroupOrganisation.setName(organisation.getName());
            organisationGroupOrganisation.setOrganisationId(orgId);
            organisationGroupOrganisation.setOrganisationGroup(organisationGroup);
            organisationGroupOrganisations.add(organisationGroupOrganisation);
        }
        organisationGroup.setOrganisationGroupOrganisations(organisationGroupOrganisations);
    }
}
