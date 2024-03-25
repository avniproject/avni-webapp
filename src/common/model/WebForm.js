import { Form } from "openchs-models";
import WebFormElementGroup from "./WebFormElementGroup";

class WebForm extends Form {
  get formElementGroups() {
    return this.toEntityList("formElementGroups", WebFormElementGroup);
  }

  set formElementGroups(x) {
    this.that.formElementGroups = this.fromEntityList(x);
  }
}

export default WebForm;
