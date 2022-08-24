package org.avni.web.menu;

import org.avni.application.menu.MenuItem;
import org.avni.dao.application.MenuItemRepository;
import org.avni.web.AbstractController;
import org.avni.web.request.application.menu.MenuItemContract;
import org.avni.web.response.AvniEntityResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class MenuItemWebController extends AbstractController<MenuItem> {
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
    public MenuItemContract get(@PathVariable("id") Long id) {
        MenuItem entity = menuItemRepository.findEntity(id);
        return createContract(entity);
    }

    private MenuItemContract createContract(MenuItem entity) {
        MenuItemContract contract = new MenuItemContract();
        contract.setUuid(entity.getUuid());
        contract.setId(entity.getId());
        contract.setGroup(entity.getGroup());
        contract.setIcon(entity.getIcon());
        contract.setType(entity.getType());
        contract.setDisplayKey(entity.getDisplayKey());
        contract.setLinkFunction(entity.getLinkFunction());
        contract.setVoided(entity.isVoided());
        return contract;
    }

    @RequestMapping(value = "/web/menuItem", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public List<MenuItemContract> get() {
        return menuItemRepository.findAll().stream().map(this::createContract).collect(Collectors.toList());
    }
}
