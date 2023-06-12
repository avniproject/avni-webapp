import { GET_LIST, GET_ONE } from "react-admin";
import CollectionUtil from "../../../common/utils/CollectionUtil";
import EtlJobService from "../../service/etl/EtlJobService";

class OrganisationAndOrgGroupDataProvider {
  static SupportedOperations = [GET_LIST, GET_ONE];

  static supportsOperation(operation) {
    return this.SupportedOperations.includes(operation);
  }

  static execute(type, params, resource, resourcePromise) {
    if (type === GET_LIST) {
      return resourcePromise.then(raListResponse => {
        const entityUUIDs = raListResponse.data.map(x => x.uuid);
        return EtlJobService.getJobStatuses(entityUUIDs).then(jobStatuses => {
          const map = CollectionUtil.toObject(jobStatuses.data, "entityUUID", "analyticsEnabled");
          raListResponse.data.forEach(x => (x["analyticsDataSyncActive"] = map[x["uuid"]]));
          return raListResponse;
        });
      });
    } else if (type === GET_ONE) {
      return resourcePromise.then(raResource => {
        return EtlJobService.getJob(raResource.data.uuid, resource)
          .then(jobSummary => {
            raResource.data["analyticsDataSyncActive"] = jobSummary != null;
            return raResource;
          })
          .catch(() => raResource);
      });
    }
  }
}

export default OrganisationAndOrgGroupDataProvider;
