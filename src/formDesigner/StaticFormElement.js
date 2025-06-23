import React from "react";
import { Accordion, Typography, Tooltip, Grid, InputLabel, AccordionSummary } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ToolTip } from "../common/components/ToolTip";
import { dataTypeIcons } from "./components/FormElement";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%"
  },
  iconlay: {
    paddingTop: "3px"
  },
  expandIcon: {
    paddingTop: "3px",
    paddingRight: "0px"
  },
  iconDataType: {
    padding: "10px"
  },
  questionCount: {
    paddingTop: "20px"
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
    paddingTop: "10px"
  },
  secondaryHeading: {
    flexBasis: "70%",
    fontSize: theme.typography.pxToRem(15)
  },
  asterisk: {
    color: "red"
  }
}));

const StaticFormElement = ({ groupIndex, index, dataType, name, ...props }) => {
  const classes = useStyles();
  const panel = "panel" + groupIndex.toString() + index.toString();

  return (
    <Accordion TransitionProps={{ mountOnEnter: false, unmountOnExit: false }} expanded={false} className={classes.root}>
      <AccordionSummary aria-controls={panel + "bh-content"} id={panel + "bh-header"}>
        <div className={classes.iconlay}>
          <Typography component="div" className={classes.secondaryHeading}>
            {["Date", "Numeric", "Text"].includes(dataType) && (
              <div className={classes.iconDataType}>
                <Tooltip title={dataType}>{dataTypeIcons[dataType]}</Tooltip>
              </div>
            )}
            {dataType === "Coded" && (
              <div className={classes.iconDataType}>
                <Tooltip title={dataType + " : SingleSelect"}>{dataTypeIcons["concept"]["SingleSelect"]}</Tooltip>
              </div>
            )}
          </Typography>
        </div>
        <Grid
          container
          sm={12}
          sx={{
            alignItems: "center"
          }}
        >
          <Grid item sm={11} style={{ paddingTop: "10px" }}>
            <Typography component="span" className={classes.heading}>
              <InputLabel name={"name" + panel} style={{ display: "inline-block" }} required classes={{ asterisk: classes.asterisk }}>
                {name}
              </InputLabel>
            </Typography>
          </Grid>
          <Grid item sm={1} direction="row">
            <ToolTip toolTipKey="APP_DESIGNER_FORM_ELEMENT_NAME" onHover displayPosition="bottom" />
          </Grid>
        </Grid>
      </AccordionSummary>
    </Accordion>
  );
};
export default StaticFormElement;
