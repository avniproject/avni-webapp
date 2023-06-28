import httpClient from "../../../common/utils/httpClient";
import AvniServiceNames from "../../../common/AvniServiceNames";

class EtlJobService {
  static getJobStatuses(organisationUUIDs) {
    return httpClient.postOtherOriginJson(
      "etl/job/status",
      AvniServiceNames.ETL,
      organisationUUIDs
    );
  }

  static getJob(organisationUUID) {
    return httpClient
      .getFromDifferentOrigin(`etl/job/${organisationUUID}`, AvniServiceNames.ETL)
      .then(response => {
        return response.data;
      })
      .catch(axiosError => {
        if (axiosError.response.status === 404) return null;
        throw axiosError;
      });
  }
}

export default EtlJobService;
