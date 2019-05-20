package org.openchs.web;

import org.openchs.dao.AddressLevelTypeRepository;
import org.openchs.domain.AddressLevelType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@RepositoryRestController
public class AddressLevelTypeController implements RestControllerResourceProcessor<AddressLevelType> {

    private final AddressLevelTypeRepository addressLevelTypeRepository;

    @Autowired
    public AddressLevelTypeController(AddressLevelTypeRepository addressLevelTypeRepository) {
        this.addressLevelTypeRepository = addressLevelTypeRepository;
    }

    @GetMapping(value = "/addressLevelType")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    public PagedResources<Resource<AddressLevelType>> getAll(Pageable pageable) {
        return wrap(addressLevelTypeRepository.findAll(pageable));
    }

}
