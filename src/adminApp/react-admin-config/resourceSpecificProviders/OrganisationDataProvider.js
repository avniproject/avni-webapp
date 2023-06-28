import { GET_LIST, GET_ONE } from "react-admin";
import CollectionUtil from "../../../common/utils/CollectionUtil";
import EtlJobService from "../../service/etl/EtlJobService";

class OrganisationDataProvider {
  static SupportedOperations = [GET_LIST, GET_ONE];

  static supportsOperation(operation) {
    return this.SupportedOperations.includes(operation);
  }

  static execute(type, params, resourcePromise) {
    if (type === GET_LIST) {
      return resourcePromise.then(raListResponse => {
        const organisationUUIDs = raListResponse.data.map(x => x.uuid);
        return EtlJobService.getJobStatuses(organisationUUIDs).then(organisationJobStatuses => {
          const map = CollectionUtil.toObject(
            organisationJobStatuses.data,
            "organisationUUID",
            "analyticsEnabled"
          );
          raListResponse.data.forEach(x => (x["analyticsDataSyncActive"] = map[x["uuid"]]));
          return raListResponse;
        });
      });
    } else if (type === GET_ONE) {
      return resourcePromise.then(raResource => {
        return EtlJobService.getJob(raResource.data.uuid).then(jobSummary => {
          raResource.data["analyticsDataSyncActive"] = jobSummary != null;
          return raResource;
        });
      });
    }
  }
}

export default OrganisationDataProvider;
