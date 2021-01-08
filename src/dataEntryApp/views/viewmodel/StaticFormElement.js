class StaticFormElement {
  constructor(name, mandatory, editable) {
    this.name = name;
    this.mandatory = mandatory;
    this.editable = editable;
    this.staticElement = true;
  }
}

export default StaticFormElement;
