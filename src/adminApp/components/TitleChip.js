import Chip from "@material-ui/core/Chip";
import React from "react";

export const TitleChip = props => {
  return props.record ? <Chip label={`${props.record.name}`} /> : <></>;
};
