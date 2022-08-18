package org.avni.application.menu;

import org.avni.domain.OrganisationAwareEntity;

import javax.persistence.*;

@Entity
@Table(name = "menu_item")
public class MenuItem extends OrganisationAwareEntity {
    @Column
    private String displayKey;

    @Column
    @Enumerated(EnumType.STRING)
    private MenuItemType menuItemType;

    @Column
    private String menuItemIcon;

    @Column
    private String menuItemGroup;

    @Column
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
