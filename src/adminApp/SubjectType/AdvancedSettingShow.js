import FormLabel from "@material-ui/core/FormLabel";
import React from "react";
import _ from "lodash";

export const AdvancedSettingShow = ({ locationTypes, selectedUUIDs }) => {
  const addressLevelNames = _(locationTypes)
    .filter(({ uuid }) => _.includes(selectedUUIDs, uuid))
    .map(({ name }) => name)
    .join(", ");
  return (
    <div style={{ marginBottom: 10 }}>
      <FormLabel style={{ fontSize: "13px" }}>Lowest Address Levels</FormLabel>
      <br />
      <span style={{ fontSize: "15px" }}>{addressLevelNames}</span>
    </div>
  );
};
