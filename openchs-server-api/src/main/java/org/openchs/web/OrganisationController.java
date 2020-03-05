package org.openchs.web;

import org.openchs.dao.AccountRepository;
import org.openchs.dao.GroupRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.Account;
import org.openchs.domain.Group;
import org.openchs.domain.Organisation;
import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.OrganisationContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.persistence.criteria.Predicate;
import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
public class OrganisationController implements RestControllerResourceProcessor<Organisation> {

    private OrganisationRepository organisationRepository;
    private AccountRepository accountRepository;
    private GroupRepository groupRepository;

    @Autowired
    public OrganisationController(OrganisationRepository organisationRepository, AccountRepository accountRepository, GroupRepository groupRepository) {
        this.organisationRepository = organisationRepository;
        this.accountRepository = accountRepository;
        this.groupRepository = groupRepository;
    }

    @RequestMapping(value = "/organisation", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public ResponseEntity save(@RequestBody OrganisationContract request) {
        String tempPassword = "password";
        Organisation org = organisationRepository.findByUuid(request.getUuid());
        organisationRepository.createDBUser(request.getDbUser(), tempPassword);
        if (org == null) {
            org = new Organisation();
        }
        org.setUuid(request.getUuid() == null ? UUID.randomUUID().toString() : request.getUuid());
        org.setDbUser(request.getDbUser());
        createOrganisation(request, org);
        setOrgAccountByIdOrDefault(org, request.getAccountId());
        organisationRepository.save(org);
        addDefaultGroup(org.getId());
        return new ResponseEntity<>(org, HttpStatus.CREATED);
    }

    private void addDefaultGroup(Long organisationId){
        Group group = new Group();
        group.setName("Everyone");
        group.setOrganisationId(organisationId);
        group.setUuid(UUID.randomUUID().toString());
        group.setVersion(0);
        groupRepository.save(group);
    }

    @RequestMapping(value = "/organisation", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public List<OrganisationContract> findAll() {
        User user = UserContextHolder.getUserContext().getUser();
        List<Organisation> organisations = organisationRepository.findByAccount_AccountAdmin_User_Id(user.getId());
        return organisations.stream().map(OrganisationContract::fromEntity).collect(Collectors.toList());
    }

    @RequestMapping(value = "/organisation/{id}", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public OrganisationContract findById(@PathVariable Long id) {
        User user = UserContextHolder.getUserContext().getUser();
        Organisation organisation = organisationRepository.findByIdAndAccount_AccountAdmin_User_Id(id, user.getId());
        return organisation != null ? OrganisationContract.fromEntity(organisation) : null;
    }

    @RequestMapping(value = "/organisation/{id}", method = RequestMethod.PUT)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public Organisation updateOrganisation(@PathVariable Long id, @RequestBody OrganisationContract request) throws Exception {
        User user = UserContextHolder.getUserContext().getUser();
        Organisation organisation = organisationRepository.findByIdAndAccount_AccountAdmin_User_Id(id, user.getId());
        if (organisation == null) {
            throw new Exception(String.format("Organisation %s not found", request.getName()));
        }
        createOrganisation(request, organisation);
        setOrgAccountByIdOrDefault(organisation, request.getAccountId());
        return organisationRepository.save(organisation);
    }


    @RequestMapping(value = "/organisation/search/find", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    @ResponseBody
    public Page<OrganisationContract> find(@RequestParam(value = "name", required = false) String name,
                                           @RequestParam(value = "dbUser", required = false) String dbUser,
                                           Pageable pageable) {
        User user = UserContextHolder.getUserContext().getUser();
        List<Account> ownedAccounts = accountRepository.findAllByAccountAdmin_User_Id(user.getId());
        Page<Organisation> organisations = organisationRepository.findAll((root, query, builder) -> {
            Predicate predicate = builder.equal(root.get("isVoided"), false);
            if (name != null) {
                predicate = builder.and(predicate, builder.like(builder.upper(root.get("name")), "%" + name.toUpperCase() + "%"));
            }
            if (dbUser != null) {
                predicate = builder.and(predicate, builder.like(builder.upper(root.get("dbUser")), "%" + dbUser.toUpperCase() + "%"));
            }
            List<Predicate> predicates = new ArrayList<>();
            ownedAccounts.forEach(account -> predicates.add(builder.equal(root.get("account"), account)));
            Predicate accountPredicate = builder.or(predicates.toArray(new Predicate[predicates.size()]));
            return builder.and(accountPredicate, predicate);
        }, pageable);
        return organisations.map(OrganisationContract::fromEntity);
    }

    private void createOrganisation(@RequestBody OrganisationContract request, Organisation organisation) {
        organisation.setName(request.getName());
        organisation.setUsernameSuffix(request.getUsernameSuffix());
        if (request.getParentOrganisationId() != null) {
            Organisation parentOrg = organisationRepository.findOne(request.getParentOrganisationId());
            organisation.setParentOrganisationId(parentOrg != null ? parentOrg.getId() : null);
        }
        organisation.setMediaDirectory(request.getMediaDirectory());
        organisation.setVoided(request.isVoided());
    }

    private void setOrgAccountByIdOrDefault(Organisation organisation, Long accountId) {
        User user = UserContextHolder.getUserContext().getUser();
        Account account = accountId == null ? accountRepository.findAllByAccountAdmin_User_Id(user.getId()).stream().findFirst().orElse(null)
                : accountRepository.findOne(accountId);
        organisation.setAccount(account);
    }

}
