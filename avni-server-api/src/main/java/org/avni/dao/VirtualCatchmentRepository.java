package org.avni.dao;

import org.avni.domain.Catchment;
import org.avni.domain.VirtualCatchment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VirtualCatchmentRepository extends JpaRepository<VirtualCatchment, Long> {
    List<VirtualCatchment> findByCatchment(Catchment catchment);
}
