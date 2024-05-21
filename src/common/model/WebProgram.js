import { Program } from "openchs-models";

class WebProgram {
  static fromResource(resource) {
    const program = new Program();
    program.uuid = resource.uuid;
    program.name = resource.name;
    return program;
  }

  static fromResources(resources) {
    return resources.map(WebProgram.fromResource);
  }
}

export default WebProgram;
