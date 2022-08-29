package org.avni.web.request.application.menu;

import org.avni.application.menu.MenuItemGroup;
import org.avni.application.menu.MenuItemType;
import org.avni.domain.CHSEntity;
import org.avni.web.request.CHSRequest;

public class MenuItemContract extends CHSRequest {
    private String displayKey;
    private MenuItemType type;
    private String icon;
    private MenuItemGroup group;
    private String linkFunction;

    public MenuItemContract() {
    }

    public MenuItemContract(CHSEntity entity) {
        super(entity);
    }

    public String getDisplayKey() {
        return displayKey;
    }

    public void setDisplayKey(String displayKey) {
        this.displayKey = displayKey;
    }

    public MenuItemType getType() {
        return type;
    }

    public void setType(MenuItemType type) {
        this.type = type;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public MenuItemGroup getGroup() {
        return group;
    }

    public void setGroup(MenuItemGroup group) {
        this.group = group;
    }

    public String getLinkFunction() {
        return linkFunction;
    }

    public void setLinkFunction(String linkFunction) {
        this.linkFunction = linkFunction;
    }
}
