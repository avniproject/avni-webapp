import { FormElement } from "openchs-models";
import WebFormElementGroup from "./WebFormElementGroup";
import _ from 'lodash';

class WebFormElement extends FormElement {
  get group() {
    return this.toEntity("group", WebFormElement);
  }

  set group(x) {
    this.that.group = this.fromObject(x);
  }

  get questionGroupIndex() {
      return this.that.questionGroupIndex;
  }

  set questionGroupIndex(x) {
      this.that.questionGroupIndex = x;
  }

  newFormElement() {
    return new WebFormElement();
  }

  clone() {
    const clone = super.clone();
    clone.group = this.group;
    return clone;
  }

  get formElementGroup() {
    return this.toEntity("formElementGroup", WebFormElementGroup);
  }

  set formElementGroup(x) {
    this.that.formElementGroup = this.fromObject(x);
  }

  static logFormElement(fe) {
    let feToString = `UUID:${fe.uuid} Name:${fe.name} Display:${fe.displayOrder}`;
    if (!_.isNil(fe.group)) {
      feToString += ` QGName:${fe.group.name} QGUuid:${fe.groupUuid} QGI:${fe.questionGroupIndex}`;
    }
    console.log(feToString);
  }

  static logFormElements(formElements) {
    formElements.forEach((x) => WebFormElement.logFormElement(x));
    console.log("------------------------------------------------------------");
  }
}

export default WebFormElement;
