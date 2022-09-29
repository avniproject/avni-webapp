package org.avni.server.service;

import org.avni.server.dao.AccountAdminRepository;
import org.avni.server.dao.AccountRepository;
import org.avni.server.domain.AccountAdmin;
import org.avni.server.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountAdminService {

    private final Logger logger;
    private AccountAdminRepository accountAdminRepository;
    private AccountRepository accountRepository;

    public AccountAdminService(AccountAdminRepository accountAdminRepository, AccountRepository accountRepository) {
        this.accountAdminRepository = accountAdminRepository;
        this.accountRepository = accountRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public void createAccountAdmins(User user, List<Long> accountIds) {
        accountIds.forEach(accountId -> {
            AccountAdmin accountAdmin = accountAdminRepository.findByUser_IdAndAccount_Id(user.getId(), accountId);
            if (accountAdmin == null) {
                accountAdmin = new AccountAdmin();
            }
            accountAdmin.setUser(user);
            accountAdmin.setAccount(accountRepository.findById(accountId).orElse(null));
            accountAdmin.setName(user.getName());
            logger.info("Saving account admin {}", user.getName());
            accountAdminRepository.save(accountAdmin);
        });
    }

}
