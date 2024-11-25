import { get, isNil } from "lodash";
import { Encounter } from "avni-models";
import { mapBasicEncounter } from "./BaseEncounterMapper";

export const getNewEligibleEncounters = (encounterTypes, eligibleEncounters) => {
  const scheduledEncounters = get(eligibleEncounters, "scheduledEncounters", []).map(pe => mapBasicEncounter(new Encounter(), pe));
  const unplannedEncounters = get(eligibleEncounters, "eligibleEncounterTypeUUIDs", [])
    .map(uuid => {
      const result = encounterTypes.find(eT => eT.uuid === uuid);
      if (!isNil(result)) {
        const encounter = new Encounter();
        encounter.encounterType = result;
        encounter.name = encounter.encounterType.operationalEncounterTypeName;
        return encounter;
      }
      return null;
    })
    .filter(enc => !isNil(enc));
  return { scheduledEncounters, unplannedEncounters };
};
