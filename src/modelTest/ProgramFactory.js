import { Program } from "openchs-models";

class ProgramFactory {
  static create({ uuid, name }) {
    const program = new Program();
    program.uuid = uuid;
    program.name = name;
    return program;
  }
}

export default ProgramFactory;
