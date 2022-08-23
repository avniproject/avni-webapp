package org.avni.web.menu;

import org.avni.application.menu.MenuItem;
import org.avni.dao.application.MenuItemRepository;
import org.avni.web.AbstractController;
import org.avni.web.request.application.menu.MenuItemContract;
import org.avni.web.response.AvniEntityResponse;
import org.springframework.beans.factory.annotation.Autowired;
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
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public List<AvniEntityResponse> post(@RequestBody List<MenuItemContract> menuItemRequests) {
        return menuItemRequests.stream().map(this::post).collect(Collectors.toList());
    }

    @RequestMapping(value = "/web/menuItem", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public AvniEntityResponse post(@RequestBody MenuItemContract request) {
        MenuItem menuItem = newOrExistingEntity(menuItemRepository, request, new MenuItem());
        menuItem.setGroup(request.getGroup());
        menuItem.setIcon(request.getIcon());
        menuItem.setType(request.getType());
        menuItem.setDisplayKey(request.getDisplayKey());
        menuItem.setLinkFunction(request.getLinkFunction());
        return new AvniEntityResponse(menuItemRepository.save(menuItem));
    }

    @RequestMapping(value = "/web/menuItem/{id}", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    public MenuItemContract get(@PathVariable("id") Long id) {
        MenuItem entity = menuItemRepository.findEntity(id);
        MenuItemContract contract = new MenuItemContract();
        contract.setUuid(entity.getUuid());
        contract.setId(entity.getId());
        contract.setGroup(entity.getGroup());
        contract.setIcon(entity.getIcon());
        contract.setType(entity.getType());
        contract.setDisplayKey(entity.getDisplayKey());
        contract.setLinkFunction(entity.getLinkFunction());
        return contract;
    }
}
