import React from "react";
import { Grid } from "@material-ui/core";
import FormLabel from "@material-ui/core/FormLabel";
import { createdAudit, modifiedAudit } from "../../adminApp/components/AuditUtil";

export const Audit = ({
  createdBy,
  lastModifiedBy,
  createdDateTime,
  modifiedDateTime,
  direction
}) => {
  return (
    <Grid container direction={direction || "column"} justify={"space-between"} xs={12} spacing={2}>
      <Grid item container direction={"column"} spacing={1} xs={6}>
        <Grid item>
          <FormLabel style={{ fontSize: "13px" }}>Created </FormLabel>
        </Grid>
        <Grid item>
          <span style={{ fontSize: "15px" }}>{createdAudit({ createdBy, createdDateTime })}</span>
        </Grid>
      </Grid>
      <Grid
        item
        container
        direction={"column"}
        spacing={1}
        xs={6}
        alignContent={direction ? "flex-end" : "flex-start"}
      >
        <Grid item>
          <FormLabel style={{ fontSize: "13px" }}>Modified </FormLabel>
        </Grid>
        <Grid item>
          <span style={{ fontSize: "15px" }}>
            {modifiedAudit({
              lastModifiedBy,
              lastModifiedDateTime: modifiedDateTime
            })}
          </span>
        </Grid>
      </Grid>
    </Grid>
  );
};
