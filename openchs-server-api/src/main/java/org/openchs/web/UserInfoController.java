package org.openchs.web;

import org.openchs.dao.CatchmentRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.Catchment;
import org.openchs.domain.Organisation;
import org.openchs.web.request.UserInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserInfoController {

    private final CatchmentRepository catchmentRepository;
    private final OrganisationRepository organisationRepository;

    @Autowired
    public UserInfoController(CatchmentRepository catchmentRepository, OrganisationRepository organisationRepository) {
        this.catchmentRepository = catchmentRepository;
        this.organisationRepository = organisationRepository;
    }

    @RequestMapping(value = "/userInfo", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    public ResponseEntity<UserInfo> getUserInfo(@RequestParam(value = "catchmentId", required = true) Integer catchmentId) {
        Catchment catchment = this.catchmentRepository.findOne(Long.valueOf(catchmentId));
        Organisation organisation = this.organisationRepository.findOne(catchment.getOrganisationId());
        return new ResponseEntity<>(new UserInfo(catchment.getType(), organisation.getName()), HttpStatus.OK);
    }
}
