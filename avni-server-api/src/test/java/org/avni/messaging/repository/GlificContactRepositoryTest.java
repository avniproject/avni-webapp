package org.avni.messaging.repository;

import org.avni.messaging.contract.glific.GlificContactResponse;
import org.avni.messaging.contract.glific.GlificCreateContactResponse;
import org.avni.messaging.contract.glific.GlificGetContactsResponse;
import org.avni.messaging.external.GlificRestClient;
import org.junit.Test;

import java.util.ArrayList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class GlificContactRepositoryTest {

    @Test
    public void shouldCreateContactIfNotAvailable() {
        GlificRestClient glificRestClient = mock(GlificRestClient.class);
        GlificContactRepository repository = new GlificContactRepository(glificRestClient);
        GlificGetContactsResponse getContactsResponse = new GlificGetContactsResponse();
        getContactsResponse.setContacts(new ArrayList<>());
        GlificCreateContactResponse createContactResponse = new GlificCreateContactResponse();
        GlificContactResponse contact = new GlificContactResponse();
        contact.setId("1234");
        createContactResponse.setCreateContact(contact);
        when(glificRestClient
                .callAPI(any(), any()))
                .thenReturn(getContactsResponse)
                .thenReturn(createContactResponse);

        String responseId = repository.getOrCreateGlificContactId("9182738475");

        assertThat(responseId).isEqualTo("1234");
        verify(glificRestClient).callAPI(eq("{\"query\":\"query contacts($filter: ContactFilter, $opts: Opts) { contacts(filter: $filter, opts:$opts) { id name optinTime optoutTime optinMethod optoutMethod phone maskedPhone bspStatus status tags { id label } groups { id label } }}\",\"variables\":{\"filter\":{\"phone\":\"9182738475\"},\"opts\":{\"order\":\"ASC\",\"limit\":10,\"offset\":0}}}"), any());
        verify(glificRestClient).callAPI(eq("{\"query\":\"mutation createContact($input:ContactInput!) { createContact(input: $input) { contact { id name optinTime optoutTime phone bspStatus status tags { id label } } errors { key message } } }\",\"variables\":{\"input\":{\"name\":\"This is a new contact for this example\",\"phone\":\"9182738475\"}}}"), any());
    }
}