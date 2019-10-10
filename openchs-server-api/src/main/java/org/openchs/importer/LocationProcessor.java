package org.openchs.importer;

import org.openchs.dao.LocationRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.User;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.importer.format.Row;
import org.openchs.service.LocationService;
import org.openchs.web.request.LocationContract;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.openchs.framework.security.AuthenticationFilter.*;

public class LocationProcessor implements ItemProcessor<Row, List<AddressLevel>> {

    @Value("#{jobParameters['userId']}")
    private Long userId;
    private LocationService locationService;
    private LocationRepository locationRepository;
    private UserRepository userRepository;
    private OrganisationRepository organisationRepository;

    public LocationProcessor(LocationService locationService, LocationRepository locationRepository, UserRepository userRepository, OrganisationRepository organisationRepository) {
        this.locationService = locationService;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.organisationRepository = organisationRepository;
    }

    @Override
    public List<AddressLevel> process(Row row) throws Exception {
        authenticate();
        AddressLevel parent = null;
        List<AddressLevel> locations = new ArrayList<>(row.size());
        System.out.println(Thread.currentThread().getId() + Thread.currentThread().getName());
        for (String header : row.getHeaders()) {
//            if (true) break;
            String lineage = parent == null
                    ? row.get(header)
                    : parent.getTitleLineage() + ", " + row.get(header);
            AddressLevel location = locationRepository.findByTitleLineageIgnoreCase(lineage);
            if (location == null) {
                LocationContract locationContract = new LocationContract();
                locationContract.setupUuidIfNeeded();
                locationContract.setName(row.get(header));
                locationContract.setType(header);
                locationContract.setLevel((double) lineage.split(", ").length);
                if (parent != null) {
                    locationContract.setParent(new LocationContract(parent.getUuid()));
                }
                location = locationService.save(locationContract);
            }
            parent = location;
            locations.add(location);
        }
        return locations;
    }

    private void authenticate() {
        SecurityContextHolder.getContext().setAuthentication(createTempAuth());
        Authentication authentication = this.attemptAuthentication();
        SecurityContextHolder.getContext().setAuthentication(authentication);

    }

    private Authentication attemptAuthentication() {
        UserContext userContext = new UserContext();
        User user = userRepository.findOne(userId);
        userContext.setUser(user);
        userContext.setOrganisation(organisationRepository.findOne(user.getOrganisationId()));

        List<SimpleGrantedAuthority> authorities = Stream.of(USER_AUTHORITY, ADMIN_AUTHORITY, ORGANISATION_ADMIN_AUTHORITY)
                .filter(authority -> userContext.getRoles().contains(authority.getAuthority()))
                .collect(Collectors.toList());
        UserContextHolder.create(userContext);

        if (authorities.isEmpty()) return null;
        return createTempAuth(authorities);
    }

    private Authentication createTempAuth() {
        return createTempAuth(Arrays.asList(USER_AUTHORITY, ADMIN_AUTHORITY, ORGANISATION_ADMIN_AUTHORITY));
    }

    private Authentication createTempAuth(List<SimpleGrantedAuthority> authorities) {
        String token = UUID.randomUUID().toString();
        return new AnonymousAuthenticationToken(token, token, authorities);
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}