import { get, isNil } from "lodash";
import { ProgramEncounter } from "openchs-models";
import { mapBasicEncounter } from "./BaseEncounterMapper";

export const getNewEligibleProgramEncounters = (encounterTypes, eligibleEncounters) => {
  const planEncounterList = get(eligibleEncounters, "scheduledEncounters", []).map(planEncounter =>
    mapBasicEncounter(new ProgramEncounter(), planEncounter)
  );

  const unplanEncounterList = get(eligibleEncounters, "eligibleEncounterTypeUUIDs", [])
    .map(uuid => {
      const result = encounterTypes.find(eT => eT.uuid === uuid);
      if (!isNil(result)) {
        const unplannedVisit = new ProgramEncounter();
        unplannedVisit.encounterType = result;
        unplannedVisit.name = unplannedVisit.encounterType.operationalEncounterTypeName;
        return unplannedVisit;
      }
      return null;
    })
    .filter(enc => !isNil(enc));
  return { planEncounterList, unplanEncounterList };
};
