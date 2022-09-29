package org.avni.server.dao;

import org.avni.server.domain.GroupPrivilege;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "groupPrivilege", path = "groupPrivilege")
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface GroupPrivilegeRepository extends ReferenceDataRepository<GroupPrivilege>, FindByLastModifiedDateTime<GroupPrivilege> {
    default GroupPrivilege findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in GroupPrivilege.");
    }

    default GroupPrivilege findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in GroupPrivilege.");
    }

    List<GroupPrivilege> findByGroup_Id(Long groupId);

    @Query(value = "select distinct on (subject_type_id, program_id, program_encounter_type_id, encounter_type_id, checklist_detail_id) * \n" +
            "from group_privilege gp \n" +
            "         join user_group ug on ug.group_id = gp.group_id \n" +
            "         join privilege p on gp.privilege_id = p.id \n" +
            "where ug.user_id = :userId \n" +
            "  and gp.is_voided = false \n" +
            "  and ug.is_voided = false \n" +
            "  and p.name in ('View checklist','View enrolment details','View subject','View visit') \n" +
            "  and allow = true", nativeQuery = true)
    List<GroupPrivilege> getAllAllowPrivilegesForUser(Long userId);

}
