package org.openchs.web;

import org.openchs.builder.BuilderException;
import org.openchs.dao.CatchmentRepository;
import org.openchs.dao.LocationRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Catchment;
import org.openchs.domain.Organisation;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.service.CatchmentService;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.CatchmentContract;
import org.openchs.web.request.CatchmentsContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class CatchmentController implements RestControllerResourceProcessor<CatchmentContract> {
    private final Logger logger;
    private CatchmentRepository catchmentRepository;
    private LocationRepository locationRepository;
    private OrganisationRepository organisationRepository;
    private final CatchmentService catchmentService;

    @Autowired
    public CatchmentController(CatchmentRepository catchmentRepository, LocationRepository locationRepository, OrganisationRepository organisationRepository, CatchmentService catchmentService) {
        this.catchmentRepository = catchmentRepository;
        this.locationRepository = locationRepository;
        this.organisationRepository = organisationRepository;
        this.catchmentService = catchmentService;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @GetMapping(value = "catchment")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public PagedResources<Resource<CatchmentContract>> get(Pageable pageable) {
        Page<Catchment> all = catchmentRepository.findPageByIsVoidedFalse(pageable);
        Page<CatchmentContract> catchmentContracts = all.map(catchment -> {
            CatchmentContract catchmentContract = CatchmentContract.fromEntity(catchment);
            return catchmentContract;
        });
        return wrap(catchmentContracts);
    }

    @GetMapping(value = "catchment/{id}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public Resource<CatchmentContract> getById(@PathVariable Long id) {
        Catchment catchment = catchmentRepository.findOne(id);
        CatchmentContract catchmentContract = CatchmentContract.fromEntity(catchment);
        return new Resource<>(catchmentContract);
    }

    @GetMapping(value = "catchment/search/findAllById")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public List<CatchmentContract> getById(@Param("ids") Long[] ids) {
        List<Catchment> catchments = catchmentRepository.findByIdIn(ids);
        return catchments.stream().map(catchment -> CatchmentContract.fromEntity(catchment)).collect(Collectors.toList());
    }

    @GetMapping(value = "catchment/search/find")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public PagedResources<Resource<CatchmentContract>> find(@RequestParam(value = "name") String name, Pageable pageable) {
        Page<Catchment> catchments = catchmentRepository.findByNameIgnoreCaseStartingWithOrderByNameAsc(name, pageable);
        Page<CatchmentContract> catchmentContracts = catchments.map(CatchmentContract::fromEntity);
        return wrap(catchmentContracts);
    }

    @PostMapping(value = "/catchment")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    @Transactional
    ResponseEntity<?> createSingleCatchment(@RequestBody @Valid CatchmentContract catchmentContract) throws Exception {
        if (catchmentRepository.findByName(catchmentContract.getName()) != null)
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError(String.format("Catchment with name %s already exists", catchmentContract.getName())));
        Catchment catchment = new Catchment();
        catchment.assignUUID();
        catchment.setName(catchmentContract.getName());
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
        Catchment catchmentWithSameName = catchmentRepository.findByName(catchmentContract.getName());
        //Do not allow to change catchment name when there is already another catchment with the same name
        if (catchmentWithSameName != null && catchmentWithSameName.getId() != catchment.getId())
            return ResponseEntity.badRequest().body(ReactAdminUtil.generateJsonError(String.format("Catchment with name %s already exists", catchmentContract.getName())));

        catchment.setName(catchmentContract.getName());
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
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    @Transactional
    ResponseEntity<?> save(@RequestBody CatchmentsContract catchmentsContract) {
        try {
            Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
            catchmentService.saveAllCatchments(catchmentsContract, organisation);
        } catch (BuilderException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return ResponseEntity.ok(null);
    }

}
