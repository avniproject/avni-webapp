package org.avni.web.menu;

import org.avni.dao.application.MenuItemRepository;
import org.avni.web.request.application.menu.MenuItemRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class MenuItemWebController {
    private final MenuItemRepository menuItemRepository;

    @Autowired
    public MenuItemWebController(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    @RequestMapping(value = "/web/menuItem", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('user')")
    @Transactional
    public void post(@RequestBody MenuItemRequest menuItemRequest) {
    }
}
