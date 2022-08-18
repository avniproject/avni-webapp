package org.avni.web.request.application.menu;

import org.avni.application.menu.MenuItemType;
import org.avni.web.request.CHSRequest;

public class MenuItemRequest extends CHSRequest {
    private String displayKey;
    private MenuItemType menuItemType;
    private String menuItemIcon;
    private String menuItemGroup;
    private String link;

    public String getDisplayKey() {
        return displayKey;
    }

    public void setDisplayKey(String displayKey) {
        this.displayKey = displayKey;
    }

    public MenuItemType getMenuItemType() {
        return menuItemType;
    }

    public void setMenuItemType(MenuItemType menuItemType) {
        this.menuItemType = menuItemType;
    }

    public String getMenuItemIcon() {
        return menuItemIcon;
    }

    public void setMenuItemIcon(String menuItemIcon) {
        this.menuItemIcon = menuItemIcon;
    }

    public String getMenuItemGroup() {
        return menuItemGroup;
    }

    public void setMenuItemGroup(String menuItemGroup) {
        this.menuItemGroup = menuItemGroup;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }
}
