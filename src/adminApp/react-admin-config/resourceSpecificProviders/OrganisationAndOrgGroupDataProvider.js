import { GET_LIST, GET_ONE } from "react-admin";
import CollectionUtil from "../../../common/utils/CollectionUtil";
import EtlJobService from "../../service/etl/EtlJobService";

class OrganisationAndOrgGroupDataProvider {
  static SupportedOperations = [GET_LIST, GET_ONE];

  static supportsOperation(operation) {
    return this.SupportedOperations.includes(operation);
  }

  static async execute(type, params, resource, resourcePromise) {
    const raResponse = await resourcePromise;

    if (type === GET_LIST) {
      const entityUUIDs = raResponse.data.map(x => x.uuid);
      const jobStatuses = await EtlJobService.getJobStatuses(entityUUIDs);
      const statusMap = CollectionUtil.toObject(jobStatuses.data, "entityUUID", "analyticsEnabled");

      const updatedData = raResponse.data.map(x => ({
        ...x,
        analyticsDataSyncActive: statusMap[x.uuid] || false
      }));

      return {
        ...raResponse,
        data: updatedData
      };
    }

    if (type === GET_ONE) {
      try {
        const jobSummary = await EtlJobService.getJob(raResponse.data.uuid, resource);
        return {
          ...raResponse,
          data: {
            ...raResponse.data,
            analyticsDataSyncActive: !!jobSummary
          }
        };
      } catch {
        return raResponse;
      }
    }

    return raResponse;
  }
}

export default OrganisationAndOrgGroupDataProvider;
