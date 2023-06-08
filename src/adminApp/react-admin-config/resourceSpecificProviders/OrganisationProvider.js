import { GET_LIST } from "react-admin";
import httpClient from "../../../common/utils/httpClient";
import SpringResponse from "../SpringResponse";
import { UrlPartsGenerator } from "../requestUtils";
import AvniServiceNames from "../../../common/AvniServiceNames";
import CollectionUtil from "../../../common/utils/CollectionUtil";

class OrganisationProvider {
  static execute(type, params) {
    if (type === GET_LIST) {
      return httpClient
        .fetchJson(`/organisation/${UrlPartsGenerator.forList(params)}`)
        .then(response => {
          const organisationList = SpringResponse.toReactAdminResourceListResponse(
            response.json,
            "organisation"
          );
          const organisationUUIDs = organisationList.data.map(x => x.uuid);
          return httpClient
            .postOtherOriginJson("etl/job/status", AvniServiceNames.ETL, organisationUUIDs)
            .then(organisationJobStatuses => {
              const map = CollectionUtil.toObject(
                organisationJobStatuses.data,
                "organisationUUID",
                "analyticsEnabled"
              );
              organisationList.data.forEach(x => (x["analyticsDataSyncActive"] = map[x["uuid"]]));
              return organisationList;
            });
        });
    }
  }
}

export default OrganisationProvider;
