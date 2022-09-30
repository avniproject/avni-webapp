package org.avni.server.web.request.application.menu;

import org.avni.server.application.menu.MenuItem;
import org.avni.server.web.request.application.menu.MenuItemContract;
import org.junit.Test;

import static org.hamcrest.MatcherAssert.*;
import static org.hamcrest.Matchers.*;

public class MenuItemContractTest {

    @Test
    public void shouldAssignUuidFromContractIfPresent() {
        MenuItemContract contract = new MenuItemContract();
        contract.setUuid("new-uuid");

        MenuItem menuItem = MenuItemContract.toEntity(contract, null);

        assertThat(menuItem.getUuid(), is(equalTo("new-uuid")));
    }

    @Test
    public void shouldAssignUuidIfNotAvailableInContract() {
        MenuItemContract contract = new MenuItemContract();

        MenuItem menuItem = MenuItemContract.toEntity(contract, null);

        assertThat(menuItem.getUuid(), is(notNullValue()));
    }

}