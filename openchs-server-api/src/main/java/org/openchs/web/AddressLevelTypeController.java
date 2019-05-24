package org.openchs.web;

import org.openchs.builder.AddressLevelTypeBuilder;
import org.openchs.dao.AddressLevelTypeRepository;
import org.openchs.domain.AddressLevelType;
import org.openchs.web.request.AddressLevelTypeContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class AddressLevelTypeController implements RestControllerResourceProcessor<AddressLevelType> {

    private final AddressLevelTypeRepository addressLevelTypeRepository;
    private Logger logger;

    @Autowired
    public AddressLevelTypeController(AddressLevelTypeRepository addressLevelTypeRepository) {
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @GetMapping(value = "/addressLevelType")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    public PagedResources<Resource<AddressLevelType>> getAll(Pageable pageable) {
        return wrap(addressLevelTypeRepository.findAll(pageable));
    }

    @PostMapping(value ="/addressLevelTypes")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @Transactional
    public ResponseEntity<?> save(@RequestBody List<AddressLevelTypeContract> addressLevelTypeContracts) {
        for (AddressLevelTypeContract addressLevelTypeContract : addressLevelTypeContracts) {
            logger.info(String.format("Processing addressLevelType request: %s", addressLevelTypeContract.getUuid()));
            AddressLevelTypeBuilder addressLevelTypeBuilder
                    = new AddressLevelTypeBuilder(addressLevelTypeRepository.findByNameIgnoreCase(addressLevelTypeContract.getName()));
            addressLevelTypeBuilder.copy(addressLevelTypeContract);
            AddressLevelType addressLevelType = addressLevelTypeBuilder.build();
            addressLevelTypeRepository.save(addressLevelType);
        }
        return ResponseEntity.ok(null);
    }

}
