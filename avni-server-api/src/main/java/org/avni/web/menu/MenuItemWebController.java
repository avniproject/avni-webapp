package org.avni.web.menu;

import org.avni.application.menu.MenuItem;
import org.avni.dao.application.MenuItemRepository;
import org.avni.web.request.application.menu.MenuItemRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class MenuItemWebController {
    private final MenuItemRepository menuItemRepository;

    @Autowired
    public MenuItemWebController(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    @RequestMapping(value = "/web/menuItems", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public void post(@RequestBody List<MenuItemRequest> menuItemRequests) {
        menuItemRequests.forEach(this::post);
    }

    @RequestMapping(value = "/web/menuItem", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public void post(@RequestBody MenuItemRequest request) {
        MenuItem menuItem = menuItemRepository.findEntity(request.getId());
        if (menuItem == null)
            menuItem = new MenuItem();

        menuItem.setGroup(request.getGroup());
        menuItem.setIcon(request.getIcon());
        menuItem.setType(request.getType());
        menuItem.setDisplayKey(request.getDisplayKey());
        menuItem.setLink(request.getLink());
        menuItem.assignUUIDIfRequired();
        menuItemRepository.save(menuItem);
    }
}
