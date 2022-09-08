export function mapBasicEncounter(encounter, planEncounter) {
  encounter.encounterType = planEncounter.encounterType;
  encounter.encounterDateTime = planEncounter.encounterDateTime;
  encounter.earliestVisitDateTime = planEncounter.earliestVisitDateTime;
  encounter.maxVisitDateTime = planEncounter.maxVisitDateTime;
  encounter.name = planEncounter.name;
  encounter.uuid = planEncounter.uuid;
  return encounter;
}
