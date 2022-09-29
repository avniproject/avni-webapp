package org.avni.server.web;

import org.avni.server.builder.BuilderException;
import org.avni.server.dao.CatchmentRepository;
import org.avni.server.dao.LocationRepository;
import org.avni.server.domain.AddressLevel;
import org.avni.server.domain.Catchment;
import org.avni.server.domain.Organisation;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.service.CatchmentService;
import org.avni.server.service.ResetSyncService;
import org.avni.server.service.S3Service;
import org.avni.server.util.ReactAdminUtil;
import org.avni.server.web.request.CatchmentContract;
import org.avni.server.web.request.CatchmentsContract;
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
    private CatchmentRepository catchmentRepository;
    private LocationRepository locationRepository;
    private final CatchmentService catchmentService;
    private final S3Service s3Service;
    private final ResetSyncService resetSyncService;

    @Autowired
    public CatchmentController(CatchmentRepository catchmentRepository,
                               LocationRepository locationRepository,
                               CatchmentService catchmentService,
                               S3Service s3Service,
                               ResetSyncService resetSyncService) {
        this.catchmentRepository = catchmentRepository;
        this.locationRepository = locationRepository;
        this.catchmentService = catchmentService;
        this.s3Service = s3Service;
        this.resetSyncService = resetSyncService;
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
        boolean fastSyncExists = s3Service.fileExists(String.format("MobileDbBackup-%s", catchment.getUuid()));
        catchmentContract.setFastSyncExists(fastSyncExists);
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
        Page<Catchment> catchments = catchmentRepository.findByIsVoidedFalseAndNameIgnoreCaseStartingWithOrderByNameAsc(name, pageable);
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
        resetSyncService.recordCatchmentChange(catchment, catchmentContract);
        catchment.setName(catchmentContract.getName());
        catchment.clearAddressLevels();
        for (Long locationId : catchmentContract.getLocationIds()) {
            AddressLevel addressLevel = locationRepository.findOne(locationId);
            if(addressLevel == null)
                throw new Exception(String.format("Location id %d not found", locationId));
            addressLevel.addCatchment(catchment);
        }
        catchment.updateAudit();
        catchmentRepository.save(catchment);
        if (catchmentContract.isFastSyncExists() && catchmentContract.isDeleteFastSync()) {
            s3Service.deleteObject(String.format("MobileDbBackup-%s", catchment.getUuid()));
        }
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
