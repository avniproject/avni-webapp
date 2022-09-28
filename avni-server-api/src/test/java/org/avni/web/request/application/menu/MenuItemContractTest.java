package org.avni.web.request.application.menu;

import org.avni.application.menu.MenuItem;
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