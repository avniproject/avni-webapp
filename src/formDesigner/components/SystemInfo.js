import { Grid, FormLabel } from "@mui/material";
import { createdAudit, modifiedAudit } from "../../adminApp/components/AuditUtil";
import _ from "lodash";

export const SystemInfo = ({ uuid, createdBy, lastModifiedBy, createdDateTime, modifiedDateTime, lastModifiedDateTime, direction }) => {
  return (
    <Grid
      container
      direction={direction || "column"}
      spacing={2}
      sx={{
        justifyContent: "space-between"
      }}
    >
      <Grid container direction={"column"} spacing={1} size={6}>
        <Grid>
          <FormLabel style={{ fontSize: "13px" }}>Created </FormLabel>
        </Grid>
        <Grid>
          <span style={{ fontSize: "15px" }}>{createdAudit({ createdBy, createdDateTime })}</span>
        </Grid>
      </Grid>
      <Grid
        container
        direction={"column"}
        spacing={1}
        sx={[
          direction
            ? {
                alignContent: "flex-end"
              }
            : {
                alignContent: "flex-start"
              }
        ]}
        size={6}
      >
        <Grid>
          <FormLabel style={{ fontSize: "13px" }}>Modified </FormLabel>
        </Grid>
        <Grid>
          <span style={{ fontSize: "15px" }}>
            {modifiedAudit({
              lastModifiedBy,
              lastModifiedDateTime: modifiedDateTime || lastModifiedDateTime
            })}
          </span>
        </Grid>
        {!_.isEmpty(uuid) && (
          <Grid container direction={"column"} spacing={1} size={8}>
            <Grid>
              <FormLabel style={{ fontSize: "13px" }}>UUID </FormLabel>
            </Grid>
            <Grid>
              <span style={{ fontSize: "15px" }}>{uuid}</span>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};
