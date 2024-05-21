import { EncounterType } from "openchs-models";

class WebEncounterType {
  static fromResource(resource) {
    const encounterType = new EncounterType();
    encounterType.uuid = resource.uuid;
    encounterType.name = resource.name;
    return encounterType;
  }

  static fromResources(resources) {
    return resources.map(WebEncounterType.fromResource);
  }
}

export default WebEncounterType;
