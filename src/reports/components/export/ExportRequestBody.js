import React from "react";
import { isUndefined } from "lodash";
import Box from "@material-ui/core/Box";
import { JsonEditor } from "../../../formDesigner/components/JsonEditor";
import { Typography } from "@material-ui/core";

export const ExportRequestBody = ({ customRequest, exportRequest, dispatch }) => {
  return (
    <Box mb={2}>
      <Typography component={"div"} variant={"subtitle1"}>
        {"Request body"}
      </Typography>
      <JsonEditor
        value={
          isUndefined(customRequest) || exportRequest === customRequest
            ? JSON.stringify(exportRequest, null, 2)
            : customRequest
        }
        onChange={event => dispatch(event)}
      />
    </Box>
  );
};
