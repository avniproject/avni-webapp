import _ from "lodash";

class EntityService {
  static findByUuid(collection, uuid) {
    return _.find(collection, st => st.uuid === uuid);
  }
}

export default EntityService;
