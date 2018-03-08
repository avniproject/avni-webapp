package org.openchs.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import javassist.bytecode.stackmap.BasicBlock;
import org.junit.Assert;
import org.junit.Test;
import org.openchs.common.AbstractControllerIntegrationTest;
import org.openchs.dao.AddressLevelRepository;
import org.openchs.dao.CatchmentRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Catchment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Sql({"/test-data.sql"})
public class CatchmentControllerIntegrationTest extends AbstractControllerIntegrationTest {

    @Autowired
    public CatchmentRepository catchmentRepository;

    @Autowired
    public AddressLevelRepository addressLevelRepository;

    @Test
    public void shouldUploadCatchments() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            Object json = mapper.readValue(this.getClass().getResource("/ref/catchments/catchments.json"), Object.class);
            ResponseEntity<Void> catchmentResponse = template.postForEntity("/catchments", json, Void.class);
            assertThat(catchmentResponse.getStatusCode().is2xxSuccessful());

            Catchment ghotpadi = catchmentRepository.findByName("Ghotpadi");
            assertThat(ghotpadi).isNotNull();

            List<AddressLevel> addressLevels = addressLevelRepository.findByCatchments(ghotpadi);
            assertThat(addressLevels.size()).isEqualTo(5);

            Catchment masterCatchment = catchmentRepository.findByName("demo Master Catchment");
            assertThat(masterCatchment).isNotNull();

            List<AddressLevel> allAddressLevels = addressLevelRepository.findByCatchments(masterCatchment);
            assertThat(allAddressLevels.size()).isEqualTo(27);
        } catch (IOException e) {
            Assert.fail();
        }
    }

    @Test
    public void shouldUpdateCatchments() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            Object baseCatchments = mapper.readValue(this.getClass().getResource("/ref/catchments/catchments.json"), Object.class);
            ResponseEntity<Void> catchmentResponse = template.postForEntity("/catchments", baseCatchments, Void.class);
            assertThat(catchmentResponse.getStatusCode().is2xxSuccessful());

            Object updatedNames = mapper.readValue(this.getClass().getResource("/ref/catchments/updatedCatchments.json"), Object.class);
            ResponseEntity<Void> updateResponse = template.postForEntity("/catchments", updatedNames, Void.class);
            assertThat(updateResponse.getStatusCode().is2xxSuccessful());

            Catchment ghotpadi = catchmentRepository.findByName("Ghotpadi");
            assertThat(ghotpadi).isNotNull();

            List<AddressLevel> addressLevels = addressLevelRepository.findByCatchments(ghotpadi);
            assertThat(addressLevels.size()).isEqualTo(4);//Removed Ghotpadi Boarding School
            assertThat(
                    addressLevels.stream()
                            .filter(addressLevel -> addressLevel.getTitle().equals("Bhatpar School Updated"))
                            .findFirst().get())
                    .isNotNull();
        } catch (IOException e) {
            Assert.fail();
        }
    }

}
