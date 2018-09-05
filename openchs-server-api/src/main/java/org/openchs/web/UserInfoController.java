package org.openchs.web;

import org.openchs.dao.CatchmentRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.dao.UserFacilityMappingRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.*;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.IndividualRequest;
import org.openchs.web.request.UserContract;
import org.openchs.web.request.UserInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class UserInfoController {
    private final CatchmentRepository catchmentRepository;
    private UserRepository userRepository;
    private UserFacilityMappingRepository userFacilityMappingRepository;
    private OrganisationRepository organisationRepository;
    private final Logger logger;

    @Autowired
    public UserInfoController(CatchmentRepository catchmentRepository, UserRepository userRepository, UserFacilityMappingRepository userFacilityMappingRepository, OrganisationRepository organisationRepository) {
        this.catchmentRepository = catchmentRepository;
        this.userRepository = userRepository;
        this.userFacilityMappingRepository = userFacilityMappingRepository;
        this.organisationRepository = organisationRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/userInfo", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    public ResponseEntity<UserInfo> getUserInfo(@RequestParam(value = "catchmentId", required = true) Integer catchmentId) {
        Catchment catchment = this.catchmentRepository.findOne(Long.valueOf(catchmentId));
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();

        if (catchment == null){
            logger.info(String.format("Catchment not found for ID: %s", catchmentId));
            return new ResponseEntity<>(new UserInfo(null, null), HttpStatus.NOT_FOUND);
        }
        if (organisation == null){
            logger.info(String.format("Organisation not found for catchment ID: %s", catchmentId));
            return new ResponseEntity<>(new UserInfo(null, null), HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(new UserInfo(catchment.getType(), organisation.getName()), HttpStatus.OK);
    }

    @RequestMapping(value = "/users", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    public void save(@RequestBody UserContract userContract) {
        logger.info(String.format("Saving user with UUID %s", userContract.getUuid()));

        User user = userRepository.findByUuid(userContract.getUuid());
        if (user == null) {
            user = new User();
            user.setUuid(userContract.getUuid());
        }
        Catchment catchment = catchmentRepository.findByUuid(userContract.getCatchmentUUID());
        user.setCatchment(catchment);

        List<UserFacilityMapping> userFacilityMappings = userContract.getUserFacilityMappingContracts().stream().map(userFacilityMappingContract -> userFacilityMappingRepository.findByUuid(userFacilityMappingContract.getUuid())).collect(Collectors.toList());
        user.addUserFacilityMappings(userFacilityMappings);

        userRepository.save(user);
        logger.info(String.format("Saved User with UUID %s", userContract.getUuid()));
    }
}
