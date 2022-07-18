update entity_approval_status
set sync_concept_1_value = e.sync_concept_1_value,
    sync_concept_2_value = e.sync_concept_2_value,
    address_id = e.address_id
from encounter e where e.id = entity_approval_status.entity_id and entity_approval_status.entity_type = 'Encounter';

update entity_approval_status
set sync_concept_1_value = e.sync_concept_1_value,
    sync_concept_2_value = e.sync_concept_2_value,
    address_id = e.address_id
from program_enrolment e where e.id = entity_approval_status.entity_id and entity_approval_status.entity_type = 'ProgramEnrolment';

update entity_approval_status
set sync_concept_1_value = e.sync_concept_1_value,
    sync_concept_2_value = e.sync_concept_2_value,
    address_id = e.address_id
from individual e where e.id = entity_approval_status.entity_id and entity_approval_status.entity_type = 'Subject';

update entity_approval_status
set sync_concept_1_value = e.sync_concept_1_value,
    sync_concept_2_value = e.sync_concept_2_value,
    address_id = e.address_id
from program_encounter e where e.id = entity_approval_status.entity_id and entity_approval_status.entity_type = 'ProgramEncounter';