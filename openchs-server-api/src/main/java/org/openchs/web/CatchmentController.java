package org.openchs.web;

import org.openchs.builder.BuilderException;
import org.openchs.dao.CatchmentRepository;
import org.openchs.dao.LocationRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Catchment;
import org.openchs.domain.Organisation;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.AddressLevelContract;
import org.openchs.web.request.CatchmentContract;
import org.openchs.web.request.CatchmentsContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

@RestController
public class CatchmentController implements RestControllerResourceProcessor<CatchmentContract> {
    private final Logger logger;
    private CatchmentRepository catchmentRepository;
    private LocationRepository locationRepository;
    private OrganisationRepository organisationRepository;

    @Autowired
    public CatchmentController(CatchmentRepository catchmentRepository, LocationRepository locationRepository, OrganisationRepository organisationRepository) {
        this.catchmentRepository = catchmentRepository;
        this.locationRepository = locationRepository;
        this.organisationRepository = organisationRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @GetMapping(value = "catchment")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public PagedResources<Resource<CatchmentContract>> get(Pageable pageable) {
        Page<Catchment> all = catchmentRepository.findPageByIsVoidedFalse(pageable);
        Page<CatchmentContract> catchmentContracts = all.map(catchment -> {
            CatchmentContract catchmentContract = CatchmentContract.fromEntity(catchment);
            return catchmentContract;
        });
        return wrap(catchmentContracts);
    }

    @GetMapping(value = "catchment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public Resource<CatchmentContract> getById(@PathVariable Long id) {
        Catchment catchment = catchmentRepository.findOne(id);
        CatchmentContract catchmentContract = CatchmentContract.fromEntity(catchment);
        return new Resource<>(catchmentContract);
    }

    @PostMapping(value = "/catchment")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    ResponseEntity<?> createSingleCatchment(@RequestBody @Valid CatchmentContract catchmentContract) throws Exception {
        if(catchmentRepository.findByName(catchmentContract.getName()) != null)
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError(String.format("Catchment with name %s already exists", catchmentContract.getName())));
        Catchment catchment = new Catchment();
        catchment.assignUUID();
        catchment.setName(catchmentContract.getName());
        catchment.setType(catchmentContract.getType());
        for (Long locationId : catchmentContract.getLocationIds()) {
            AddressLevel addressLevel = locationRepository.findOne(locationId);
            if(addressLevel == null)
                throw new Exception(String.format("Location id %d not found", locationId));
            catchment.addAddressLevel(addressLevel);
        }
        catchmentRepository.save(catchment);
        return new ResponseEntity<>(catchment, HttpStatus.CREATED);
    }

    @PutMapping(value ="/catchment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @Transactional
    public ResponseEntity<?> updateCatchment(@PathVariable("id") Long id, @RequestBody CatchmentContract catchmentContract) throws Exception {
        Catchment catchment = catchmentRepository.findOne(id);
        catchment.setName(catchmentContract.getName());
        catchment.setType(catchmentContract.getType());
        catchment.clearAddressLevels();
        for (Long locationId : catchmentContract.getLocationIds()) {
            AddressLevel addressLevel = locationRepository.findOne(locationId);
            if(addressLevel == null)
                throw new Exception(String.format("Location id %d not found", locationId));
            addressLevel.addCatchment(catchment);
        }
        catchmentRepository.save(catchment);
        return new ResponseEntity<>(catchment, HttpStatus.OK);
    }

    @DeleteMapping(value ="/catchment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @Transactional
    public ResponseEntity<?> voidCatchment(@PathVariable("id") Long id) {
        Catchment catchment = catchmentRepository.findOne(id);
        if (catchment == null) {
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError(String.format("AddressLevelType with id %d not found", id)));
        }
        catchment.setVoided(true);
//        catchmentRepository.save(catchment);
        return new ResponseEntity<>(CatchmentContract.fromEntity(catchment), HttpStatus.OK);
    }

    @RequestMapping(value = "/catchments", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    ResponseEntity<?> save(@RequestBody CatchmentsContract catchmentsContract) {
        try {
            Organisation organisation = organisationRepository.findByName(catchmentsContract.getOrganisation());
            saveAll(catchmentsContract, organisation);
        } catch (BuilderException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return ResponseEntity.ok(null);
    }

    private List<Catchment> saveAll(CatchmentsContract catchmentsContract, Organisation organisation) throws BuilderException {
        List<Catchment> catchments = new ArrayList<>();
        for (CatchmentContract catchmentRequest : catchmentsContract.getCatchments()) {
            logger.info(String.format("Processing catchment request: %s", catchmentRequest.toString()));

            if (catchmentExistsWithSameNameAndDifferentUUID(catchmentRequest)) {
                throw new BuilderException(String.format("Catchment %s exists with different uuid", catchmentRequest.getName()));
            }

            Catchment catchment = catchmentRepository.findByUuid(catchmentRequest.getUuid());
            if (catchment == null) {
                logger.info(String.format("Creating catchment with uuid '%s'", catchmentRequest.getUuid()));
                catchment = createCatchment(catchmentRequest);
            }
            catchment.setName(catchmentRequest.getName());
            catchment.setType(catchmentRequest.getType());

            addAddressLevels(catchmentRequest, catchment);
            removeObsoleteAddressLevelsFromCatchment(catchment, catchmentRequest);
            catchment.setOrganisationId(organisation.getId());

            catchments.add(catchmentRepository.save(catchment));
        }
        return catchments;
    }

    private void addAddressLevels(CatchmentContract catchmentRequest, Catchment catchment) throws BuilderException {
        List<AddressLevelContract> locations = catchmentRequest.getLocations();
        if(isNull(locations) || locations.isEmpty()) {
            logger.warn(String.format("Locations not defined in Catchment {uuid='%s',locations=undefined,...}", catchment.getUuid()));
        }
        for (AddressLevelContract addressLevelRequest : locations) {
            AddressLevel addressLevel = locationRepository.findByUuid(addressLevelRequest.getUuid());
            if (addressLevel == null) {
                logger.error(String.format("AddressLevel with UUID '%s' not found.", addressLevelRequest.getUuid()));
                throw new BuilderException(String.format("AddressLevel with UUID '%s' not found.", addressLevelRequest.getUuid()));
            }
            catchment.addAddressLevel(addressLevel);
        }
    }

    private void removeObsoleteAddressLevelsFromCatchment(Catchment catchment, CatchmentContract catchmentRequest) {
        Set<String> uuidsFromRequest = catchmentRequest.getLocations().stream().map(AddressLevelContract::getUuid).collect(Collectors.toSet());
        Set<AddressLevel> addressLevels = new HashSet<>(catchment.getAddressLevels());
        for (AddressLevel addressLevel : addressLevels) {
            if (!uuidsFromRequest.contains(addressLevel.getUuid())) {
                logger.info("Removing AddressLevel " + addressLevel.getTitle() + " from catchment " + catchment.getName());
                catchment.removeAddressLevel(addressLevel);
            }
        }
    }

    private Catchment createCatchment(CatchmentContract catchmentContract) {
        Catchment catchment = new Catchment();
        catchment.setUuid(catchmentContract.getUuid());
        return catchment;
    }

    private boolean catchmentExistsWithSameNameAndDifferentUUID(CatchmentContract catchmentRequest) {
        Catchment catchment = catchmentRepository.findByName(catchmentRequest.getName());
        return catchment != null && !catchment.getUuid().equals(catchmentRequest.getUuid());
    }

}
