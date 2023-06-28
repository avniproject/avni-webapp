import httpClient from "../../../common/utils/httpClient";
import AvniServiceNames from "../../../common/AvniServiceNames";

const JOB_BASE_URL = "etl/job";

const jobEntityTypes = {
  organisation: "Organisation",
  organisationGroup: "OrganisationGroup"
};

class EtlJobService {
  static getJobStatuses(organisationUUIDs) {
    return httpClient
      .postOtherOriginJson(`${JOB_BASE_URL}/status`, AvniServiceNames.ETL, organisationUUIDs)
      .catch(e => {
        console.error(e);
        return [];
      });
  }

  static getJob(entityUUID) {
    return httpClient
      .getFromDifferentOrigin(`${JOB_BASE_URL}/${entityUUID}`, AvniServiceNames.ETL)
      .then(response => {
        return response.data;
      })
      .catch(axiosError => {
        console.error(axiosError);
        if (axiosError.response.status === 404) return null;
        throw axiosError;
      });
  }

  static createOrEnableJob(entityUUID, resource) {
    return httpClient.postOtherOriginJson(JOB_BASE_URL, AvniServiceNames.ETL, {
      entityUUID: entityUUID,
      jobEntityType: jobEntityTypes[resource]
    });
  }

  static disableJob(entityUUID) {
    return httpClient.deleteOtherOriginJson(`${JOB_BASE_URL}/${entityUUID}`, AvniServiceNames.ETL);
  }
}

export default EtlJobService;
