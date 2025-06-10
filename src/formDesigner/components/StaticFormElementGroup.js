import React from "react";
import { makeStyles } from "@mui/styles";
import { Grid, Typography, FormControl, Input, Tooltip, AccordionDetails } from "@mui/material";
import { ExpandMore, ExpandLess, Group } from "@mui/icons-material";
import { ToolTip } from "../../common/components/ToolTip";
import { StyledAccordion, StyledAccordionSummary } from "./FormElementGroup";
import StaticFormElement from "../StaticFormElement";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%"
  },
  questionCount: {
    paddingTop: "5px"
  },
  heading: {
    fontSize: theme.typography.pxToRem(15)
  },
  icon: {
    marginRight: "8px"
  }
}));

const StaticFormElementGroup = ({ name, formElements }) => {
  const classes = useStyles();
  const panel = "static-panel";
  const [expanded, setExpanded] = React.useState(false);

  const renderFormElements = () => {
    const groupIndex = 1;
    return formElements.map(({ dataType, name }, index) => (
      <div key={index} style={{ paddingLeft: "20px", paddingBottom: "30px" }}>
        <StaticFormElement name={name} index={index} dataType={dataType} groupIndex={groupIndex} />
      </div>
    ));
  };

  return (
    <Grid item xs={12}>
      <StyledAccordion
        TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
        expanded={expanded}
        className={classes.root}
        onChange={() => setExpanded(!expanded)}
        style={{ backgroundColor: "#E0E0E0" }}
      >
        <StyledAccordionSummary aria-controls={`${panel}-bh-content`} id={`${panel}-bh-header`}>
          <Grid container sm={12} alignItems="center">
            <Grid item sm={1}>
              <Tooltip title="Grouped Questions">
                <Group style={{ marginLeft: 12, marginRight: 4 }} />
              </Tooltip>
              {expanded ? <ExpandLess className={classes.icon} /> : <ExpandMore className={classes.icon} />}
            </Grid>
            <Grid item sm={6}>
              <Typography className={classes.heading}>
                <FormControl fullWidth>
                  <Input
                    type="text"
                    placeholder="Group name"
                    name={`name${panel}`}
                    disableUnderline
                    value={name}
                    autoComplete="off"
                    disabled
                  />
                </FormControl>
              </Typography>
            </Grid>
            <Grid item sm={4}>
              <Typography component="div" className={classes.questionCount}>
                {formElements.length} questions
              </Typography>
            </Grid>
            <Grid item sm={1}>
              <ToolTip title="APP_DESIGNER_FORM_ELEMENT_GROUP_NAME" displayPosition="bottom" />
            </Grid>
          </Grid>
        </StyledAccordionSummary>
        <AccordionDetails style={{ padding: 0 }}>
          <Grid direction="column" style={{ width: "100%", marginTop: 20 }}>
            <Grid style={{ width: "100%", alignContent: "center", marginBottom: 8 }}>
              <Typography component="span" className={classes.root}>
                {renderFormElements()}
              </Typography>
            </Grid>
          </Grid>
        </AccordionDetails>
      </StyledAccordion>
    </Grid>
  );
};

export default StaticFormElementGroup;
