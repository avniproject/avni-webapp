import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { FormControl, Input, makeStyles } from "@material-ui/core";
import { ToolTip } from "../../common/components/ToolTip";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails/ExpansionPanelDetails";
import React from "react";
import { ExpansionPanel, ExpansionPanelSummary } from "./FormElementGroup";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import Tooltip from "@material-ui/core/Tooltip";
import GroupIcon from "@material-ui/icons/ViewList";
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
  }
}));

const StaticFormElementGroup = ({ name, formElements, ...props }) => {
  const classes = useStyles();
  const panel = "static panel";
  const [expanded, setExpanded] = React.useState(false);

  const renderFormElements = () => {
    const groupIndex = 1;
    return formElements.map(({ dataType, name }, index) => (
      <div style={{ paddingLeft: 20, paddingBottom: 30 }}>
        <StaticFormElement name={name} index={index} dataType={dataType} groupIndex={groupIndex} />
      </div>
    ));
  };

  return (
    <Grid item>
      <ExpansionPanel
        TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
        expanded={expanded}
        className={classes.root}
        onChange={() => setExpanded(!expanded)}
        style={{ backgroundColor: "#E0E0E0" }}
      >
        <ExpansionPanelSummary aria-controls={panel + "bh-content"} id={panel + "bh-header"}>
          <Grid container sm={12} alignItems={"center"}>
            <Grid item sm={1}>
              <Tooltip title={"Grouped Questions"}>
                <GroupIcon style={{ marginLeft: 12, marginRight: 4 }} />
              </Tooltip>
              {expanded ? (
                <ExpandLessIcon classes={{ root: classes.icon }} />
              ) : (
                <ExpandMoreIcon classes={{ root: classes.icon }} />
              )}
            </Grid>
            <Grid item sm={6}>
              <Typography className={classes.heading}>
                <FormControl fullWidth>
                  <Input
                    type="text"
                    placeholder="Group name"
                    name={"name" + panel}
                    disableUnderline={true}
                    value={name}
                    autoComplete="off"
                    disabled={true}
                  />
                </FormControl>
              </Typography>
            </Grid>
            <Grid item sm={4}>
              <Typography component={"div"} className={classes.questionCount}>
                {formElements.length} questions
              </Typography>
            </Grid>
            <Grid item sm={1}>
              <ToolTip
                toolTipKey={"APP_DESIGNER_FORM_ELEMENT_GROUP_NAME"}
                onHover
                displayPosition={"bottom"}
              />
            </Grid>
          </Grid>
        </ExpansionPanelSummary>
        <MuiExpansionPanelDetails style={{ padding: 0, paddingLeft: 0, paddingRight: 0 }}>
          <Grid direction={"column"} style={{ width: "100%", marginTop: 20 }}>
            <Grid style={{ width: "100%", alignContent: "center", marginBottom: 8 }}>
              <Typography component={"span"} className={classes.root}>
                {renderFormElements()}
              </Typography>
            </Grid>
          </Grid>
        </MuiExpansionPanelDetails>
      </ExpansionPanel>
    </Grid>
  );
};

export default StaticFormElementGroup;
