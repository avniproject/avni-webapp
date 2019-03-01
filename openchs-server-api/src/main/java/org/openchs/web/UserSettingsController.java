package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.UserSettingsRepository;
import org.openchs.domain.Individual;
import org.openchs.domain.User;
import org.openchs.domain.UserSettings;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.service.UserService;
import org.openchs.web.request.UserSettingsContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;

@RestController
public class UserSettingsController extends AbstractController<UserSettings> implements RestControllerResourceProcessor<UserSettings> {

    private final UserSettingsRepository userSettingsRepository;
    private final UserService userService;

    @Autowired
    public UserSettingsController(UserSettingsRepository userSettingsRepository, UserService userService) {
        this.userSettingsRepository = userSettingsRepository;
        this.userService = userService;
    }

    @RequestMapping(value = "/userSettings", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public PagedResources<Resource<UserSettings>> getUserSettingsByUser(
            @RequestParam("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @RequestParam("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable) {
        User user = userService.getCurrentUser();
        return wrap(userSettingsRepository.findByUserIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(user.getId(), lastModifiedDateTime, now, pageable));
    }

    @RequestMapping(value = "/userSettings", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize("hasAnyAuthority('organisation_admin', 'user')")
    public void save(@RequestBody UserSettingsContract userSettingsContract) {
        userSettingsRepository.save(createUserSettings(userSettingsContract));
    }

    private UserSettings createUserSettings(UserSettingsContract contract) {
        UserSettings userSettings = newOrExistingEntity(userSettingsRepository, contract, new UserSettings());

        User user = userService.getCurrentUser();
        userSettings.setUser(user);
        userSettings.setOrganisationId(user.getOrganisationId());
        userSettings.setTrackLocation(contract.getTrackLocation());
        userSettings.setLocale(contract.getLocale());
        userSettings.setVoided(contract.isVoided());

        return userSettings;

    }
}
