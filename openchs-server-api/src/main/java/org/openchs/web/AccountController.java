package org.openchs.web;

import org.openchs.dao.AccountRepository;
import org.openchs.domain.Account;
import org.openchs.domain.User;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.AccountRequest;
import org.openchs.web.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class AccountController implements RestControllerResourceProcessor<Account> {
    private AccountRepository accountRepository;

    @Autowired
    public AccountController(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @RequestMapping(value = "/accounts", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public List<Account> findAll() {
        User user = UserContextHolder.getUserContext().getUser();
        return accountRepository.findAllByAccountAdmin_User_IdOrderById(user.getId());
    }

    @RequestMapping(value = "/account", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    public ResponseEntity createAccount(@RequestBody AccountRequest accountRequest) {
        if (accountRepository.findByName(accountRequest.getName()) != null) {
            throw new ValidationException(String.format("Account %s already exists", accountRequest.getName()));
        }
        Account account = new Account();
        account.setName(accountRequest.getName());
        accountRepository.save(account);
        return new ResponseEntity<>(account, HttpStatus.CREATED);
    }

}
