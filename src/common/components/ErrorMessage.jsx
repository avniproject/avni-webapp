import { Typography } from "@mui/material";

import _ from "lodash";

export default function({ error, additionalStyle = {}, customErrorMessage }) {
  if (_.isNil(error)) return null;

  let message = error.message;
  if (error.response && error.response.data)
    message += " - " + error.response.data;
  console.error(message);
  return (
    <Typography
      variant="h5"
      sx={{ color: theme => theme.palette.error.main, ...additionalStyle }}
    >
      {customErrorMessage ? customErrorMessage : "Unexpected error occurred."}
    </Typography>
  );
}
