import { Chip } from "@mui/material";
import React from "react";

export const TitleChip = props => {
  return props.record ? <Chip label={`${props.record.name}`} /> : <></>;
};
