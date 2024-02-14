import React from "react";
import {
  ExpansionPanel as MuiExpansionPanel,
  ExpansionPanelSummary as MuiExpansionPanelSummary,
  Typography,
  Tooltip,
  ExpansionPanelDetails
} from "@material-ui/core";
import { isEmpty, filter, map, orderBy, size } from "lodash";
import Grid from "@material-ui/core/Grid";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ListIcon from "@material-ui/icons/List";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import ShowDashboardSectionCards from "./ShowDashboardSectionCards";
import { ShowLabelValue } from "../../common/ShowLabelValue";

const useStyles = makeStyles(theme => ({
  parent: {
    paddingLeft: 0,
    paddingBottom: 30
  },
  root: {
    width: "100%"
  },
  rootError: {
    width: "100%",
    border: "1px solid red"
  },
  iconlay: {
    flex: 1,
    alignItems: "center"
  },
  questionCount: {
    paddingTop: "5px"
  },

  absolute: {
    position: "absolute",
    marginLeft: 20,
    marginTop: -20
  },
  heading: {
    fontSize: theme.typography.pxToRem(15)
  },
  secondaryHeading: {
    flexBasis: "70%",
    fontSize: theme.typography.pxToRem(15)
    //color: theme.palette.text.secondary,
  },
  tabs: {
    minHeight: "26px",
    height: "26px"
  },
  tab: {
    minHeight: "26px",
    height: "26px"
  },
  formElementGroupInputText: {
    lineHeight: "56px"
  }
}));
export const ExpansionPanel = withStyles({
  root: {
    "&$expanded": {
      margin: 0
    }
  },
  expanded: {}
})(MuiExpansionPanel);
export const ExpansionPanelSummary = withStyles({
  root: {
    paddingRight: 0,
    backgroundColor: "#dbdbdb",
    border: "1px solid #2196F3",
    paddingLeft: 0,
    minHeight: 56,
    "&$expanded": {
      minHeight: 56
    },
    "&$focused": {
      backgroundColor: "#dbdbdb"
    }
  },
  focused: {},
  content: {
    margin: "0",
    "&$expanded": { margin: "0" }
  },
  expanded: {},
  icon: {
    marginHorizontal: "8px",
    display: "inline"
  }
})(MuiExpansionPanelSummary);

const ShowDashboardSections = ({ sections, history }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <React.Fragment>
      {!isEmpty(sections) && (
        <div>
          {map(orderBy(sections, "displayOrder"), (section, index) => (
            <div>
              <ExpansionPanel
                key={index}
                expanded={expanded === "panel" + index}
                onChange={handleChange("panel" + index)}
              >
                <ExpansionPanelSummary
                  aria-controls={"panel" + index + "bh-content"}
                  id={"panel" + index + "bh-header"}
                >
                  <Grid container direction={"row"}>
                    <Grid container item sm={12} alignItems={"center"}>
                      <Grid item sm={1}>
                        <Tooltip title={"Grouped Questions"}>
                          <ListIcon style={{ marginLeft: 12, marginRight: 4 }} />
                        </Tooltip>
                        {expanded === "panel" + index ? (
                          <ExpandLessIcon classes={{ root: classes.icon }} />
                        ) : (
                          <ExpandMoreIcon classes={{ root: classes.icon }} />
                        )}
                      </Grid>
                      <Grid item sm={5}>
                        <Typography className={classes.heading}>{section.name}</Typography>
                      </Grid>
                      <Grid item sm={3}>
                        <Typography className={classes.questionCount}>
                          {size(
                            filter(
                              section.dashboardSectionCardMappings,
                              sectionCardMapping => sectionCardMapping.voided === false
                            )
                          )}{" "}
                          cards
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <Grid container>
                    <Grid item xs={12}>
                      <ShowLabelValue label={"Description"} value={section.description} />
                    </Grid>
                    <Grid item xs={12}>
                      <ShowLabelValue label={"View Type"} value={section.viewType} />
                    </Grid>
                    <Grid item xs={12}>
                      <ShowDashboardSectionCards
                        section={section}
                        cards={filter(
                          section.cards,
                          card =>
                            card.voided === false &&
                            filter(
                              section.dashboardSectionCardMappings,
                              sectionCardMapping => sectionCardMapping.voided === false
                            )
                              .map(sectionCardMapping => sectionCardMapping.reportCardUUID)
                              .includes(card.uuid)
                        )}
                        history={history}
                      />
                    </Grid>
                  </Grid>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </div>
          ))}
        </div>
      )}
    </React.Fragment>
  );
};

export default ShowDashboardSections;
