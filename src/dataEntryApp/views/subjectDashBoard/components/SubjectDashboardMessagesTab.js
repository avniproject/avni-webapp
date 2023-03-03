import React, {Fragment} from "react";
import {makeStyles} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import {Paper} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import MessagesView from "../../../../common/components/messages/MessagesView";

const useStyles = makeStyles(theme => ({
  expansionHeading: {
    fontSize: "1rem",
    flexBasis: "33.33%",
    flexShrink: 0,
    fontWeight: "500",
    margin: "0"
  },
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    boxShadow: "0px 0px 4px 1px rgba(0,0,0,0.3)"
  }
}));

const SubjectDashboardMessagesTab = ({
                                       sentMessages,
                                       isMsgsSentAvailable,
                                       msgsYetToBeSent,
                                       isMsgsNotYetSentAvailable
                                     }) => {
  const {t} = useTranslation();
  const classes = useStyles();
  return (
    <Fragment>
      {
        <Paper className={classes.root}>
          <Typography
            component={"span"}
            style={{paddingBottom: 10, display: "block"}}
            className={classes.expansionHeading}
          >
            {t("Messages")}
          </Typography>
          <MessagesView isMsgsNotYetSentAvailable={isMsgsNotYetSentAvailable}
                        isMsgsSentAvailable={isMsgsSentAvailable} msgsYetToBeSent={msgsYetToBeSent}
                        sentMessages={sentMessages}/>
        </Paper>
      }
    </Fragment>
  );
};

export default SubjectDashboardMessagesTab;
