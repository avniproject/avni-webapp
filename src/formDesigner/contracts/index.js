export class FormElementContract {
  constructor(uuid, name, displayOrder, concept, keyValues, collapse) {
    this.uuid = uuid;
    this.name = name;
    this.displayOrder = displayOrder;
    this.concept = concept;
    this.keyValues = keyValues;
    this.collapse = collapse;
  }
}

export class FormElementGroupContract {
  constructor(
    uuid,
    groupId,
    name,
    displayOrder,
    display,
    formElements,
    collapse
  ) {
    this.uuid = uuid;
    this.groupId = groupId;
    this.name = name;
    this.displayOrder = displayOrder;
    this.display = display;
    this.formElements = formElements;
    this.collapse = collapse;
  }
}
