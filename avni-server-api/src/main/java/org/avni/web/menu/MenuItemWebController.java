package org.avni.web.menu;

import org.avni.application.menu.MenuItem;
import org.avni.dao.application.MenuItemRepository;
import org.avni.web.AbstractController;
import org.avni.web.RestControllerResourceProcessor;
import org.avni.web.request.application.menu.MenuItemContract;
import org.avni.web.response.AvniEntityResponse;
import org.avni.web.response.MenuItemWebResponse;
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

    @Autowired
    public MenuItemWebController(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
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
        MenuItem menuItem = new MenuItem();
        updateMenuItem(request, menuItem);
        return new AvniEntityResponse(menuItemRepository.save(menuItem));
    }

    private void updateMenuItem(MenuItemContract request, MenuItem menuItem) {
        menuItem.assignUUIDIfRequired();
        menuItem.setGroup(request.getGroup());
        menuItem.setIcon(request.getIcon());
        menuItem.setType(request.getType());
        menuItem.setDisplayKey(request.getDisplayKey());
        menuItem.setLinkFunction(request.getLinkFunction());
    }

    @PutMapping(value = "/web/menuItem/{id}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    public ResponseEntity<?> put(@PathVariable("id") Long id, @RequestBody MenuItemContract request) {
        MenuItem menuItem = menuItemRepository.findEntity(id);
        updateMenuItem(request, menuItem);
        return new ResponseEntity<>(menuItemRepository.save(menuItem), HttpStatus.OK);
    }

    @RequestMapping(value = "/web/menuItem/{id}", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    public MenuItemContract getOne(@PathVariable("id") Long id) {
        MenuItem entity = menuItemRepository.findEntity(id);
        return createResponse(entity);
    }

    private MenuItemWebResponse createResponse(MenuItem entity) {
        MenuItemWebResponse response = new MenuItemWebResponse(entity);
        response.setGroup(entity.getGroup());
        response.setIcon(entity.getIcon());
        response.setType(entity.getType());
        response.setDisplayKey(entity.getDisplayKey());
        response.setLinkFunction(entity.getLinkFunction());
        response.setCreatedBy(entity.getCreatedBy().getName());
        response.setLastModifiedBy(entity.getLastModifiedBy().getName());
        response.setCreatedDateTime(entity.getCreatedDateTime());
        response.setLastModifiedDateTime(entity.getLastModifiedDateTime());
        return response;
    }

    @RequestMapping(value = "/web/menuItem", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public PagedResources<MenuItemWebResponse> getAll() {
        return wrapListAsPage(menuItemRepository.findAllByIsVoidedFalse().stream().map(this::createResponse).collect(Collectors.toList()));
    }

    @DeleteMapping(value = "/web/menuItem/{id}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    public ResponseEntity delete(@PathVariable("id") Long id) {
        menuItemRepository.voidEntity(id);
        return ResponseEntity.ok(null);
    }
}
