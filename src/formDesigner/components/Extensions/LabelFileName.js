import Grid from "@material-ui/core/Grid";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import { Input } from "@material-ui/core";
import React from "react";
import IconButton from "@material-ui/core/IconButton";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import Select from "react-select";

export const LabelFileName = ({ label, fileName, scope, index, dispatch, options }) => {
  return (
    <Grid container direction={"row"} spacing={5} alignItems={"center"}>
      <Grid item>
        <AvniFormLabel label={"Label"} toolTipKey={"APP_DESIGNER_PRINT_LABEL"} />
        <Input
          id={label}
          value={label}
          onChange={event =>
            dispatch({ type: "setLabel", payload: { index, value: event.target.value } })
          }
        />
      </Grid>
      <Grid item>
        <AvniFormLabel label={"File Name"} toolTipKey={"APP_DESIGNER_PRINT_FILE_NAME"} />
        <Input
          id={fileName}
          value={fileName}
          onChange={event =>
            dispatch({ type: "setFileName", payload: { index, value: event.target.value } })
          }
        />
      </Grid>
      <Grid item>
        <div style={{ width: "300px" }}>
          <AvniFormLabel
            label={"Select Extension Scope *"}
            toolTipKey={"APP_DESIGNER_PRINT_SCOPE"}
            position={"top"}
          />
          <Select
            placeholder={"Extension scope"}
            value={scope}
            options={options}
            onChange={({ value }) => dispatch({ type: "setScope", payload: { index, value } })}
          />
        </div>
      </Grid>
      <Grid item>
        {index !== 0 && (
          <IconButton
            style={{ color: "#d0011b" }}
            component="span"
            onClick={() => dispatch({ type: "removeSetting", payload: { index } })}
          >
            <RemoveCircleIcon />
          </IconButton>
        )}
      </Grid>
    </Grid>
  );
};
