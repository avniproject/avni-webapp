import { FormElementGroup } from "openchs-models";
import WebFormElement from "./WebFormElement";
import WebForm from "./WebForm";

class WebFormElementGroup extends FormElementGroup {
  get formElements() {
    return this.toEntityList("formElements", WebFormElement);
  }

  set formElements(x) {
    this.that.formElements = this.fromEntityList(x);
  }

  get form() {
    return this.toEntity("form", WebForm);
  }

  set form(x) {
    this.that.form = this.fromObject(x);
  }
}

export default WebFormElementGroup;
