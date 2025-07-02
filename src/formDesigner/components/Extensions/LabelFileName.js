import { Grid, Input, IconButton } from "@mui/material";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import React from "react";
import { RemoveCircle } from "@mui/icons-material";
import Select from "react-select";

export const LabelFileName = ({ label, fileName, scope, index, dispatch, options }) => {
  return (
    <Grid
      container
      direction={"row"}
      spacing={5}
      sx={{
        alignItems: "center"
      }}
    >
      <Grid>
        <AvniFormLabel label={"Label"} toolTipKey={"APP_DESIGNER_PRINT_LABEL"} />
        <Input id={label} value={label} onChange={event => dispatch({ type: "setLabel", payload: { index, value: event.target.value } })} />
      </Grid>
      <Grid>
        <AvniFormLabel label={"File Name"} toolTipKey={"APP_DESIGNER_PRINT_FILE_NAME"} />
        <Input
          id={fileName}
          value={fileName}
          onChange={event => dispatch({ type: "setFileName", payload: { index, value: event.target.value } })}
        />
      </Grid>
      <Grid>
        <div style={{ width: "300px" }}>
          <AvniFormLabel label={"Select Extension Scope *"} toolTipKey={"APP_DESIGNER_PRINT_SCOPE"} position={"top"} />
          <Select
            placeholder={"Extension scope"}
            value={scope}
            options={options}
            onChange={({ value }) => dispatch({ type: "setScope", payload: { index, value } })}
          />
        </div>
      </Grid>
      <Grid>
        {index !== 0 && (
          <IconButton
            style={{ color: "#d0011b" }}
            component="span"
            onClick={() => dispatch({ type: "removeSetting", payload: { index } })}
            size="large"
          >
            <RemoveCircle />
          </IconButton>
        )}
      </Grid>
    </Grid>
  );
};
