import React, { Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import { bold } from "ansi-colors";
import { Paper } from "@material-ui/core";
import YetToBeSentMessagesTable from "../YetToBeSentMessagesTable";
import SentMessagesTable from "../SentMessagesTable";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  expansionHeading: {
    fontSize: "1rem",
    flexBasis: "33.33%",
    flexShrink: 0,
    fontWeight: "500",
    margin: "0"
  },
  expansionSecondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary
  },
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    boxShadow: "0px 0px 4px 1px rgba(0,0,0,0.3)"
  },
  expansionSubHeading: {
    fontSize: theme.typography.pxToRem(13),
    flexBasis: "33.33%",
    flexShrink: 0,
    fontWeight: "400",
    margin: "0"
  },
  listItemView: {
    border: "1px solid lightGrey"
  },
  expansionPanel: {
    marginBottom: "11px",
    borderRadius: "5px",
    boxShadow:
      "0px 0px 3px 1px rgba(0,0,0,0.2), 0px 1px 2px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
  },
  card: {
    boxShadow: "0px 0px 0px 0px rgba(0,0,0,0.12)",
    borderRight: "1px solid rgba(0,0,0,0.12)",
    borderRadius: "0"
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 14
  },
  headingBold: {
    fontWeight: bold
  },
  gridBottomBorder: {
    borderBottom: "1px solid rgba(0,0,0,0.12)",
    paddingBottom: "10px"
  },
  infomsg: {
    marginLeft: 10
  },
  expandMoreIcon: {
    color: "#0e6eff"
  }
}));

const SubjectDashboardMessagesTab = ({
  sentMessages,
  isMsgsSentAvailable,
  msgsYetToBeSent,
  isMsgsNotYetSentAvailable
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = React.useState(false);
  return (
    <Fragment>
      {
        <Paper className={classes.root}>
          <Typography
            component={"span"}
            style={{ paddingBottom: 10, display: "block" }}
            className={classes.expansionHeading}
          >
            {t("Glific Messages")}
          </Typography>
          <ExpansionPanel className={classes.expansionPanel}>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}
              aria-controls="yetToBeSentMessagesPanelbh-content"
              id="yet-to-be-sent-messages"
            >
              <Typography component={"span"} className={classes.expansionHeading}>
                {t("Messages Yet To Be Sent")}
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails style={{ padding: 0, display: "block" }}>
              <YetToBeSentMessagesTable
                msgsYetToBeSent={msgsYetToBeSent || []}
                isMsgsNotYetSentAvailable={isMsgsNotYetSentAvailable}
              />
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel
            className={classes.expansionPanel}
            onChange={() => setIsExpanded(p => !p)}
          >
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}
              aria-controls="sentMessagesPanelbh-content"
              id="sent-messages"
            >
              <Typography component={"span"} className={classes.expansionHeading}>
                {t("Sent Messages")}
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails style={{ padding: 0, display: "block" }}>
              {isExpanded && (
                <SentMessagesTable
                  sentMessages={sentMessages || []}
                  isMsgsSentAvailable={isMsgsSentAvailable}
                />
              )}
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Paper>
      }
    </Fragment>
  );
};

export default SubjectDashboardMessagesTab;
