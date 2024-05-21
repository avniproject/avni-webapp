import _ from "lodash";

function valueMapper(x) {
  return x.uuid;
}

function labelValueMapper(x) {
  return { label: x.name, value: valueMapper(x) };
}

class NamedSelectableEntities {
  entities;

  static createEmpty() {
    const namedEntities = new NamedSelectableEntities();
    namedEntities.entities = [];
    return namedEntities;
  }

  static create(resources) {
    const namedEntities = new NamedSelectableEntities();
    namedEntities.entities = resources;
    return namedEntities;
  }

  toggle(selectedEntities, uuid, isMulti = false) {
    const toggledEntity = _.find(this.entities, x => valueMapper(x) === uuid);
    const removedEntities = _.remove(selectedEntities, _.some(selectedEntities, x => valueMapper(x) === valueMapper(toggledEntity)));
    if (isMulti && removedEntities.length === 0) {
      return [...selectedEntities, toggledEntity];
    } else if (!isMulti) return [toggledEntity];

    throw new Error("Cannot remove more than one entity at a time.");
  }

  clone() {
    const namedEntities = new NamedSelectableEntities();
    namedEntities.entities = this.entities;
    return namedEntities;
  }

  getSelectedValue(selectedEntities, isMulti = false) {
    if (isMulti) {
      return selectedEntities.map(labelValueMapper);
    } else if (selectedEntities.length === 0) {
      return null;
    } else {
      return labelValueMapper(selectedEntities[0]);
    }
  }

  getOptions() {
    return this.entities.map(labelValueMapper);
  }
}

export default NamedSelectableEntities;
