package org.openchs.web;

import org.openchs.builder.AddressLevelTypeBuilder;
import org.openchs.dao.AddressLevelTypeRepository;
import org.openchs.domain.AddressLevelType;
import org.openchs.web.request.AddressLevelTypeContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;

@RepositoryRestController
public class AddressLevelTypeController implements RestControllerResourceProcessor<AddressLevelType> {

    private final AddressLevelTypeRepository addressLevelTypeRepository;
    private Logger logger;

    @Autowired
    public AddressLevelTypeController(AddressLevelTypeRepository addressLevelTypeRepository) {
        this.addressLevelTypeRepository = addressLevelTypeRepository;
        this.logger = LoggerFactory.getLogger(this.getClass());
    }

    @PostMapping(value ="/addressLevelType")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @Transactional
    public ResponseEntity<?> createAddressLevelType(@RequestBody AddressLevelTypeContract addressLevelTypeContract) {
        AddressLevelTypeBuilder addressLevelTypeBuilder
                = new AddressLevelTypeBuilder(addressLevelTypeRepository.findByUuid(addressLevelTypeContract.getUuid()));
        addressLevelTypeBuilder.copy(addressLevelTypeContract);
        AddressLevelType addressLevelType = addressLevelTypeBuilder.build();
        addressLevelTypeRepository.save(addressLevelType);
        return new ResponseEntity<>(addressLevelType, HttpStatus.CREATED);
    }

    @PostMapping(value ="/addressLevelTypes")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @Transactional
    public ResponseEntity<?> save(@RequestBody List<AddressLevelTypeContract> addressLevelTypeContracts) {
        for (AddressLevelTypeContract addressLevelTypeContract : addressLevelTypeContracts) {
            logger.info(String.format("Processing addressLevelType request: %s", addressLevelTypeContract.getUuid()));
            createAddressLevelType(addressLevelTypeContract);
        }
        return ResponseEntity.ok(null);
    }
}
