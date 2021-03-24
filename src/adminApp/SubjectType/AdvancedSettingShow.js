import FormLabel from "@material-ui/core/FormLabel";
import React from "react";
import _, { isEmpty } from "lodash";
import { BooleanStatusInShow } from "../../common/components/BooleanStatusInShow";

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
    </div>
  );
};
