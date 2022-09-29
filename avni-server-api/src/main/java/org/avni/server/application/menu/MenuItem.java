package org.avni.server.application.menu;

import org.avni.server.domain.OrganisationAwareEntity;

import javax.persistence.*;

@Entity
@Table(name = "menu_item")
public class MenuItem extends OrganisationAwareEntity {
    @Column
    private String displayKey;

    @Column
    @Enumerated(EnumType.STRING)
    private MenuItemType type;

    @Column
    private String icon;

    @Column(name = "menu_group")
    @Enumerated(EnumType.STRING)
    private MenuItemGroup group;

    @Column
    private String linkFunction;

    public String getDisplayKey() {
        return displayKey;
    }

    public void setDisplayKey(String displayKey) {
        this.displayKey = displayKey;
    }

    public MenuItemType getType() {
        return type;
    }

    public void setType(MenuItemType menuItemType) {
        this.type = menuItemType;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String menuItemIcon) {
        this.icon = menuItemIcon;
    }

    public MenuItemGroup getGroup() {
        return group;
    }

    public void setGroup(MenuItemGroup menuItemGroup) {
        this.group = menuItemGroup;
    }

    public String getLinkFunction() {
        return linkFunction;
    }

    public void setLinkFunction(String linkFunction) {
        this.linkFunction = linkFunction;
    }
}
