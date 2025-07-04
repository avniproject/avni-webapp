import { Chip } from "@mui/material";

export const TitleChip = props => {
  return props.record ? <Chip label={`${props.record.name}`} /> : <></>;
};
