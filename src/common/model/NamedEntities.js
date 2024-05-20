import _ from "lodash";

function valueMapper(x) {
  return x.uuid;
}

function labelValueMapper(x) {
  return { label: x.name, value: valueMapper(x) };
}

class NamedEntities {
  entities;
  selectedEntities;

  static createEmpty() {
    const namedEntities = new NamedEntities();
    namedEntities.entities = [];
    namedEntities.selectedEntities = [];
    return namedEntities;
  }

  static fromResources(resources) {
    const namedEntities = new NamedEntities();
    namedEntities.entities = resources;
    namedEntities.selectedEntities = [];
    return namedEntities;
  }

  toggle(value, isMulti = false) {
    const removedEntities = _.remove(this.selectedEntities, _.some(this.selectedEntities, x => valueMapper(x) === value));
    const toggleEntity = _.find(this.entities, x => valueMapper(x) === value);
    if (isMulti && removedEntities.length === 0) this.selectedEntities.push(toggleEntity);
    else if (!isMulti) this.selectedEntities = [toggleEntity];
  }

  clone() {
    const namedEntities = new NamedEntities();
    namedEntities.entities = this.entities;
    namedEntities.selectedEntities = [...this.selectedEntities];
    return namedEntities;
  }

  getSelected(isMulti = false) {
    if (isMulti) {
      return this.selectedEntities.map(labelValueMapper);
    } else if (this.selectedEntities.length === 0) {
      return null;
    } else {
      return labelValueMapper(this.selectedEntities[0]);
    }
  }

  getOptions() {
    return this.entities.map(labelValueMapper);
  }
}

export default NamedEntities;
