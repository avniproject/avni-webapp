package org.avni.server.web.menu;

import org.avni.server.application.menu.MenuItem;
import org.avni.server.dao.application.MenuItemRepository;
import org.avni.server.service.application.MenuItemService;
import org.avni.server.web.response.AvniEntityResponse;
import org.avni.server.web.response.MenuItemWebResponse;
import org.avni.server.web.AbstractController;
import org.avni.server.web.RestControllerResourceProcessor;
import org.avni.server.web.request.application.menu.MenuItemContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.PagedResources;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class MenuItemWebController extends AbstractController<MenuItem> implements RestControllerResourceProcessor<MenuItemWebResponse> {
    private final MenuItemRepository menuItemRepository;
    private final MenuItemService menuItemService;

    @Autowired
    public MenuItemWebController(MenuItemRepository menuItemRepository, MenuItemService menuItemService) {
        this.menuItemRepository = menuItemRepository;
        this.menuItemService = menuItemService;
    }

    @RequestMapping(value = "/web/menuItems", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    public List<AvniEntityResponse> postMultiple(@RequestBody List<MenuItemContract> menuItemRequests) {
        return menuItemRequests.stream().map(this::post).collect(Collectors.toList());
    }

    @PostMapping("/web/menuItem")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    public AvniEntityResponse post(@RequestBody MenuItemContract request) {
        MenuItem menuItem = menuItemService.save(MenuItemContract.toEntity(request, menuItemService.find(request.getUuid())));
        return new AvniEntityResponse(menuItem);
    }

    @PutMapping(value = "/web/menuItem/{id}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    public ResponseEntity<?> put(@PathVariable("id") Long id, @RequestBody MenuItemContract request) {
        MenuItem menuItem = menuItemService.save(MenuItemContract.toEntity(request, menuItemService.find(id)));
        return new ResponseEntity<>(menuItem, HttpStatus.OK);
    }

    @RequestMapping(value = "/web/menuItem/{id}", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public MenuItemContract getOne(@PathVariable("id") Long id) {
        MenuItem entity = menuItemService.find(id);
        return new MenuItemWebResponse(entity);
    }

    @RequestMapping(value = "/web/menuItem", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public PagedResources<MenuItemWebResponse> getAll() {
        return wrapListAsPage(menuItemRepository.findAllByIsVoidedFalse().stream().map(MenuItemWebResponse::new).collect(Collectors.toList()));
    }

    @DeleteMapping(value = "/web/menuItem/{id}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    public ResponseEntity delete(@PathVariable("id") Long id) {
        menuItemRepository.voidEntity(id);
        return ResponseEntity.ok(null);
    }
}
