import React from "react";
import { Grid, FormLabel } from "@mui/material";
import { createdAudit, modifiedAudit } from "../../adminApp/components/AuditUtil";
import _ from "lodash";

export const SystemInfo = ({ uuid, createdBy, lastModifiedBy, createdDateTime, modifiedDateTime, lastModifiedDateTime, direction }) => {
  return (
    <Grid container direction={direction || "column"} justifyContent={"space-between"} spacing={2}>
      <Grid item container direction={"column"} spacing={1} xs={6}>
        <Grid item>
          <FormLabel style={{ fontSize: "13px" }}>Created </FormLabel>
        </Grid>
        <Grid item>
          <span style={{ fontSize: "15px" }}>{createdAudit({ createdBy, createdDateTime })}</span>
        </Grid>
      </Grid>
      <Grid item container direction={"column"} spacing={1} xs={6} alignContent={direction ? "flex-end" : "flex-start"}>
        <Grid item>
          <FormLabel style={{ fontSize: "13px" }}>Modified </FormLabel>
        </Grid>
        <Grid item>
          <span style={{ fontSize: "15px" }}>
            {modifiedAudit({
              lastModifiedBy,
              lastModifiedDateTime: modifiedDateTime || lastModifiedDateTime
            })}
          </span>
        </Grid>
        {!_.isEmpty(uuid) && (
          <Grid item container direction={"column"} spacing={1} xs={8}>
            <Grid item>
              <FormLabel style={{ fontSize: "13px" }}>UUID </FormLabel>
            </Grid>
            <Grid item>
              <span style={{ fontSize: "15px" }}>{uuid}</span>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};
