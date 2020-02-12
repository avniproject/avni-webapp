package org.openchs.web;

import org.openchs.dao.AccountRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.Account;
import org.openchs.domain.Organisation;
import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.OrganisationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.persistence.criteria.Predicate;
import javax.transaction.Transactional;
import java.util.List;
import java.util.UUID;

@RestController
public class OrganisationController implements RestControllerResourceProcessor<Organisation> {

    private OrganisationRepository organisationRepository;
    private AccountRepository accountRepository;

    @Autowired
    public OrganisationController(OrganisationRepository organisationRepository, AccountRepository accountRepository) {
        this.organisationRepository = organisationRepository;
        this.accountRepository = accountRepository;
    }

    @RequestMapping(value = "/organisation", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public ResponseEntity save(@RequestBody OrganisationRequest request) {
        String tempPassword = "password";
        Organisation org = organisationRepository.findByUuid(request.getUuid());
        organisationRepository.createDBUser(request.getDbUser(), tempPassword);
        if (org == null) {
            org = new Organisation();
        }
        org.setUuid(request.getUuid() == null ? UUID.randomUUID().toString() : request.getUuid());
        org.setName(request.getName());
        org.setDbUser(request.getDbUser());
        org.setUsernameSuffix(request.getUsernameSuffix());
        Organisation parentOrg = organisationRepository.findByUuid(request.getParentUuid());
        if (parentOrg != null) {
            org.setParentOrganisationId(parentOrg.getId());
        }
        org.setMediaDirectory(request.getMediaDirectory());
        org.setVoided(request.isVoided());
        setOrgAccountByIdOrDefault(org, request.getAccountId());
        organisationRepository.save(org);
        return new ResponseEntity<>(org, HttpStatus.CREATED);
    }

    private void setOrgAccountByIdOrDefault(Organisation organisation, Long accountId) {
        User user = UserContextHolder.getUserContext().getUser();
        Account account = accountId == null ? accountRepository.findAllByAccountAdmin_User_IdOrderById(user.getId()).stream().findFirst().orElse(null)
                : accountRepository.findOne(accountId);
        organisation.setAccount(account);
    }

    @RequestMapping(value = "/organisation", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public List<Organisation> findAll() {
        User user = UserContextHolder.getUserContext().getUser();
        return organisationRepository.findAllByAccount_AccountAdmin_User_Id(user.getId());
    }


    @RequestMapping(value = "/organisation/search/findAll", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    @ResponseBody
    public Page<Organisation> find(@RequestParam(value = "name", required = false) String name,
                                   @RequestParam(value = "dbUser", required = false) String dbUser,
                                   Pageable pageable) {
        return organisationRepository.findAll((root, query, builder) -> {
            Predicate predicate = builder.equal(root.get("isVoided"), false);
            if (name != null) {
                predicate = builder.and(predicate, builder.like(builder.upper(root.get("name")), "%" + name.toUpperCase() + "%"));
            }
            if (dbUser != null) {
                predicate = builder.and(predicate, builder.like(builder.upper(root.get("dbUser")), "%" + dbUser.toUpperCase() + "%"));
            }
            return predicate;
        }, pageable);
    }

}
