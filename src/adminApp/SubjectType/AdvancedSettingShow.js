import FormLabel from "@material-ui/core/FormLabel";
import React, { useState, useEffect } from "react";
import _, { isEmpty } from "lodash";
import { BooleanStatusInShow } from "../../common/components/BooleanStatusInShow";
import http from "../../common/utils/httpClient";
import { ConceptSyncAttributesShow } from "./ConceptSyncAttributeShow";

export const AdvancedSettingShow = ({ locationTypes, subjectType }) => {
  const [concept1Name, setConcept1Name] = useState("");
  const [concept2Name, setConcept2Name] = useState("");

  useEffect(() => {
    if (subjectType.syncRegistrationConcept1) {
      http
        .get(`/web/concept/${subjectType.syncRegistrationConcept1}`)
        .then(res => setConcept1Name(_.get(res, "data.name")))
        .catch(error => {});
    }
    if (subjectType.syncRegistrationConcept2) {
      http
        .get(`/web/concept/${subjectType.syncRegistrationConcept2}`)
        .then(res => setConcept2Name(_.get(res, "data.name")))
        .catch(error => {});
    }
  }, [subjectType.syncRegistrationConcept2, subjectType.syncRegistrationConcept1]);

  const addressLevelNames = _(locationTypes)
    .filter(({ uuid }) => _.includes(subjectType.locationTypeUUIDs, uuid))
    .map(({ name }) => name)
    .join(", ");
  return (
    <div style={{ marginBottom: 10 }}>
      {!isEmpty(subjectType.locationTypeUUIDs) && (
        <div>
          <FormLabel style={{ fontSize: "13px" }}>Lowest Address Levels</FormLabel>
          <br />
          <span style={{ fontSize: "15px" }}>{addressLevelNames}</span>
        </div>
      )}
      <BooleanStatusInShow status={subjectType.allowEmptyLocation} label={"Allow Empty Location"} />
      <BooleanStatusInShow status={subjectType.uniqueName} label={"Unique Name"} />
      <BooleanStatusInShow status={subjectType.shouldSyncByLocation} label={"Sync By Location"} />
      <BooleanStatusInShow
        status={subjectType.directlyAssignable}
        label={"Sync By Direct Assignment"}
      />
      <ConceptSyncAttributesShow
        subjectType={subjectType}
        concept1Name={concept1Name}
        concept2Name={concept2Name}
      />
    </div>
  );
};
