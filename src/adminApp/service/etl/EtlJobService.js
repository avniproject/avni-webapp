import httpClient from "../../../common/utils/httpClient";

const JOB_BASE_URL = "/etl/job";

const jobEntityTypes = {
  organisation: "Organisation",
  organisationGroup: "OrganisationGroup"
};

class EtlJobService {
  static getJobStatuses(organisationUUIDs) {
    return httpClient.postJson(`${JOB_BASE_URL}/status`, organisationUUIDs).catch(e => {
      console.error(e);
      return [];
    });
  }

  static getJob(entityUUID) {
    return httpClient
      .fetchJson(`${JOB_BASE_URL}/${entityUUID}`)
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
    return httpClient.postJson(JOB_BASE_URL, {
      entityUUID: entityUUID,
      jobEntityType: jobEntityTypes[resource]
    });
  }

  static disableJob(entityUUID) {
    return httpClient.deleteEntity(`${JOB_BASE_URL}/${entityUUID}`);
  }
}

export default EtlJobService;
