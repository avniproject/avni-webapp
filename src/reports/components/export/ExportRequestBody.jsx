import { isUndefined } from "lodash";
import { Box, Typography } from "@mui/material";
import { JsonEditor } from "../../../formDesigner/components/JsonEditor";

export const ExportRequestBody = ({
  customRequest,
  exportRequest,
  dispatch
}) => {
  return (
    <Box
      sx={{
        mb: 2
      }}
    >
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
