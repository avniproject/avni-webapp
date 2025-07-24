import { Grid, FormLabel } from "@mui/material";
import { createdAudit, modifiedAudit } from "../../adminApp/components/AuditUtil";
import _ from "lodash";

export const SystemInfo = ({ uuid, createdBy, lastModifiedBy, createdDateTime, modifiedDateTime, lastModifiedDateTime, direction }) => {
  const containerDirection = direction || "column";
  const rowAlignProps = containerDirection === "row" ? { ml: "auto" } : {};
  const itemAlign = containerDirection === "row" ? "center" : "flex-start";
  const textAlignValue = containerDirection === "row" ? "center" : "left";

  return (
    <Grid container direction={containerDirection} spacing={2}>
      <Grid size={{ xs: containerDirection === "row" ? 4 : 12 }}>
        <Grid container direction="column" spacing={1} alignItems={itemAlign} textAlign={textAlignValue}>
          <Grid>
            <FormLabel sx={{ fontSize: "13px" }}>Created</FormLabel>
          </Grid>
          <Grid>
            <span style={{ fontSize: "15px" }}>{createdAudit({ createdBy, createdDateTime })}</span>
          </Grid>
        </Grid>
      </Grid>

      <Grid size={{ xs: containerDirection === "row" ? 4 : 12 }} sx={rowAlignProps}>
        <Grid container direction="column" spacing={1} alignItems={itemAlign} textAlign={textAlignValue}>
          <Grid>
            <FormLabel sx={{ fontSize: "13px" }}>Modified</FormLabel>
          </Grid>
          <Grid>
            <span style={{ fontSize: "15px" }}>
              {modifiedAudit({
                lastModifiedBy,
                lastModifiedDateTime: modifiedDateTime || lastModifiedDateTime
              })}
            </span>
          </Grid>
        </Grid>
      </Grid>
      {!_.isEmpty(uuid) && (
        <Grid size={{ xs: containerDirection === "row" ? 4 : 12 }} sx={rowAlignProps}>
          <Grid container direction="column" spacing={1} alignItems={itemAlign} textAlign={textAlignValue}>
            <Grid>
              <FormLabel sx={{ fontSize: "13px" }}>UUID</FormLabel>
            </Grid>
            <Grid>
              <span style={{ fontSize: "15px" }}>{uuid}</span>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};
