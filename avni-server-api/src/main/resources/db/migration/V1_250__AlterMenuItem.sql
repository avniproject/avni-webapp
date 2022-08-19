alter table menu_item
    rename column menuItemGroup to menu_group;
alter table menu_item
    rename column displayKey to display_key;
alter table menu_item
    rename column menuItemType to type;
alter table menu_item
    add column icon character varying(255) null;
