import { get } from "lodash";
import { ProgramEncounter } from "openchs-models";
import { mapBasicEncounter } from "./BaseEncounterMapper";

export const getNewEligibleProgramEncounters = (encounterTypes, eligibleEncounters) => {
  const planEncounterList = get(eligibleEncounters, "scheduledEncounters", []).map(planEncounter =>
    mapBasicEncounter(new ProgramEncounter(), planEncounter)
  );

  const unplanEncounterList = get(eligibleEncounters, "eligibleEncounterTypeUUIDs", []).map(
    uuid => {
      const unplanVisit = new ProgramEncounter();
      unplanVisit.encounterType = encounterTypes.find(eT => eT.uuid === uuid);
      unplanVisit.name =
        unplanVisit.encounterType && unplanVisit.encounterType.operationalEncounterTypeName;
      return unplanVisit;
    }
  );
  return { planEncounterList, unplanEncounterList };
};
