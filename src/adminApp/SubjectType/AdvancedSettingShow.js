import FormLabel from "@material-ui/core/FormLabel";
import React from "react";
import _, { isEmpty } from "lodash";
import { BooleanStatusInShow } from "../../common/components/BooleanStatusInShow";
import { ShowLabelValue } from "../../formDesigner/common/ShowLabelValue";

export const AdvancedSettingShow = ({ locationTypes, subjectType }) => {
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
      {subjectType.syncRegistrationConcept1 && (
        <ShowLabelValue
          label={"Sync Concept 1 UUID"}
          value={subjectType.syncRegistrationConcept1}
        />
      )}
      <BooleanStatusInShow
        status={subjectType.syncRegistrationConcept1Usable}
        label={"Sync Concept 1 Usable"}
      />
      {subjectType.syncRegistrationConcept2 && (
        <ShowLabelValue
          label={"Sync Concept 2 UUID"}
          value={subjectType.syncRegistrationConcept2}
        />
      )}
      <BooleanStatusInShow
        status={subjectType.syncRegistrationConcept2Usable}
        label={"Sync Concept 2 Usable"}
      />
    </div>
  );
};
