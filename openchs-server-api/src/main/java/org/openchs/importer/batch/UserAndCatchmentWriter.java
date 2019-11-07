package org.openchs.importer.batch;

import org.openchs.dao.LocationRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.*;
import org.openchs.importer.batch.model.Row;
import org.openchs.service.CatchmentService;
import org.openchs.service.CognitoIdpService;
import org.openchs.service.UserService;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.List;
import java.util.regex.Pattern;

import static java.lang.String.format;
import static org.openchs.domain.OperatingIndividualScope.ByCatchment;

@Component
public class UserAndCatchmentWriter implements ItemWriter<Row>, Serializable {
    private final UserService userService;
    private final CatchmentService catchmentService;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final Pattern TRUE_VALUE = Pattern.compile("yes|true|1");
    private final CognitoIdpService cognitoService;

    @Autowired
    public UserAndCatchmentWriter(CatchmentService catchmentService,
                                  LocationRepository locationRepository,
                                  UserService userService,
                                  UserRepository userRepository,
                                  CognitoIdpService cognitoService) {
        this.catchmentService = catchmentService;
        this.locationRepository = locationRepository;
        this.userService = userService;
        this.userRepository = userRepository;
        this.cognitoService = cognitoService;
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws Exception {
        String fullAddress = row.get("Location with full hierarchy");
        String catchmentName = row.get("Catchment Name");
        String nameOfUser = row.get("Full Name of User");
        String username = row.get("Username");
        String email = row.get("Email");
        String phoneNumber = row.get("Phone");
        String language = row.get("Language");
        Boolean trackLocation = TRUE_VALUE.matcher(row.getOrDefault("Track Location", "")).matches();

        AddressLevel location = locationRepository.findByTitleLineageIgnoreCase(fullAddress)
                .orElseThrow(() -> new Exception(format(
                        "Provided Location does not exist. Please check for spelling mistakes '%s'", fullAddress)));

        Catchment catchment = catchmentService.createOrUpdate(catchmentName, location);

        User.validateUsername(username);
        User user = userRepository.findByUsername(username);
        if (user != null) return;
        user = new User();
        user.assignUUIDIfRequired();
        user.setUsername(username);
        User.validateEmail(email);
        user.setEmail(email);
        User.validatePhoneNumber(phoneNumber);
        user.setPhoneNumber(phoneNumber);
        user.setName(nameOfUser);
        user.setCatchment(catchment);
        user.setOperatingIndividualScope(ByCatchment);

        user.setSettings(new JsonObject()
                .with("locale", Locale.valueByName(language))
                .with("trackLocation", trackLocation));

        User currentUser = userService.getCurrentUser();
        user.setOrganisationId(currentUser.getOrganisationId());
        user.setAuditInfo(currentUser);

        cognitoService.createUser(user);
        userService.save(user);
    }
}
