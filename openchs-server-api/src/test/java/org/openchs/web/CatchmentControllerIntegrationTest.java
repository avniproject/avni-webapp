package org.openchs.web;

import org.junit.Assert;
import org.junit.Ignore;
import org.junit.Test;
import org.openchs.common.AbstractControllerIntegrationTest;
import org.openchs.dao.LocationRepository;
import org.openchs.dao.CatchmentRepository;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Catchment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Sql({"/test-data.sql"})
@Ignore
public class CatchmentControllerIntegrationTest extends AbstractControllerIntegrationTest {
    @Autowired
    public CatchmentRepository catchmentRepository;

    @Autowired
    public LocationRepository locationRepository;

    @Test
    public void shouldUploadCatchments() {

        try {
            Object json = mapper.readValue(this.getClass().getResource("/ref/catchments/catchments.json"), Object.class);
            post("/catchments", json);

            Catchment ghotpadi = catchmentRepository.findByName("Ghotpadi");
            assertThat(ghotpadi).isNotNull();

            List<AddressLevel> addressLevels = locationRepository.findByCatchments(ghotpadi);
            assertThat(addressLevels.size()).isEqualTo(5);

            Catchment masterCatchment = catchmentRepository.findByName("demo Master Catchment");
            assertThat(masterCatchment).isNotNull();

            List<AddressLevel> allAddressLevels = locationRepository.findByCatchments(masterCatchment);
            assertThat(allAddressLevels.size()).isEqualTo(27);
        } catch (IOException e) {
            Assert.fail();
        }
    }

    @Test
    public void shouldUpdateCatchments() {
        try {
            Object baseCatchments = mapper.readValue(this.getClass().getResource("/ref/catchments/catchments.json"), Object.class);
            post("/catchments", baseCatchments);

            Object updatedNames = mapper.readValue(this.getClass().getResource("/ref/catchments/updatedCatchments.json"), Object.class);
            post("/catchments", updatedNames);

            Catchment ghotpadi = catchmentRepository.findByName("Ghotpadi");
            assertThat(ghotpadi).isNotNull();

            List<AddressLevel> addressLevels = locationRepository.findByCatchments(ghotpadi);
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
