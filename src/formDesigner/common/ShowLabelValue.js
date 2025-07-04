import { FormLabel } from "@mui/material";

export const ShowLabelValue = ({ label, value }) => {
  return (
    <div>
      <FormLabel style={{ fontSize: "13px" }}>{label}</FormLabel>
      <br />
      <span style={{ fontSize: "15px" }}>{value}</span>
    </div>
  );
};
