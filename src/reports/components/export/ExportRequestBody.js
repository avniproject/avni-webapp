import React from "react";
import Box from "@material-ui/core/Box";
import { JsonEditor } from "../../../formDesigner/components/JsonEditor";
import { isEmpty } from "lodash";
import { getNewRequestBody } from "../../export/reducer/ExportReducer";
import { Typography } from "@material-ui/core";

export const ExportRequestBody = ({ customRequest, exportRequest, dispatch }) => {
  return (
    <Box mb={2}>
      <Typography component={"div"} variant={"subtitle2"}>
        {"Request body"}
      </Typography>
      <JsonEditor
        value={
          isEmpty(customRequest)
            ? JSON.stringify(getNewRequestBody(exportRequest), null, 2)
            : customRequest
        }
        onChange={event => dispatch("customRequest", event)}
      />
    </Box>
  );
};
