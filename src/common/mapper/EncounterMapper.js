import { get } from "lodash";
import { Encounter } from "avni-models";

export const getNewEligibleEncounters = (encounterTypes, eligibleEncounters) => {
  const scheduledEncounters = get(eligibleEncounters, "scheduledEncounters", []).map(pe => {
    const encounter = new Encounter();
    encounter.encounterType = pe.encounterType;
    encounter.encounterDateTime = pe.encounterDateTime;
    encounter.earliestVisitDateTime = pe.earliestVisitDateTime;
    encounter.maxVisitDateTime = pe.maxVisitDateTime;
    encounter.name = pe.name;
    encounter.uuid = pe.uuid;
    return encounter;
  });
  const unplannedEncounters = get(eligibleEncounters, "eligibleEncounterTypeUUIDs", []).map(
    uuid => {
      const encounter = new Encounter();
      encounter.encounterType = encounterTypes.find(eT => eT.uuid === uuid);
      encounter.name =
        encounter.encounterType && encounter.encounterType.operationalEncounterTypeName;
      return encounter;
    }
  );
  return { scheduledEncounters, unplannedEncounters };
};
