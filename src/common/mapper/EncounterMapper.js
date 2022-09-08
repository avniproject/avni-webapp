import { get } from "lodash";
import { Encounter } from "avni-models";
import { mapBasicEncounter } from "./BaseEncounterMapper";

export const getNewEligibleEncounters = (encounterTypes, eligibleEncounters) => {
  const scheduledEncounters = get(eligibleEncounters, "scheduledEncounters", []).map(pe =>
    mapBasicEncounter(new Encounter(), pe)
  );
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
