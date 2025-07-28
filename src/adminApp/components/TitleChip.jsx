import { Chip } from "@mui/material";
import { useRecordContext } from "react-admin";

export const TitleChip = ({ source = "name" }) => {
  const record = useRecordContext();

  if (!record) return <></>;

  const value = record[source];
  return value ? <Chip label={`${value}`} /> : <></>;
};
