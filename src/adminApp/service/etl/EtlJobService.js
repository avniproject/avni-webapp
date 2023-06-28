import httpClient from "../../../common/utils/httpClient";
import AvniServiceNames from "../../../common/AvniServiceNames";

const JOB_BASE_URL = "etl/job";

class EtlJobService {
  static getJobStatuses(organisationUUIDs) {
    return httpClient.postOtherOriginJson(
      `${JOB_BASE_URL}/status`,
      AvniServiceNames.ETL,
      organisationUUIDs
    );
  }

  static getJob(organisationUUID) {
    return httpClient
      .getFromDifferentOrigin(`${JOB_BASE_URL}/${organisationUUID}`, AvniServiceNames.ETL)
      .then(response => {
        return response.data;
      })
      .catch(axiosError => {
        if (axiosError.response.status === 404) return null;
        throw axiosError;
      });
  }

  static createOrEnableJob(organisationUUID) {
    return httpClient.postOtherOriginJson(JOB_BASE_URL, AvniServiceNames.ETL, {
      organisationUUID: organisationUUID
    });
  }

  static disableJob(organisationUUID) {
    return httpClient.deleteOtherOriginJson(
      `${JOB_BASE_URL}/${organisationUUID}`,
      AvniServiceNames.ETL
    );
  }
}

export default EtlJobService;
