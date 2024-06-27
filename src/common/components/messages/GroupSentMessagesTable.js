import React from "react";
import { useTranslation } from "react-i18next";
import MaterialTable from "material-table";

import { formatDateTime } from "../../utils/General";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import { formatMsgTemplate } from "../utils";
import materialTableIcons from "../../material-table/MaterialTableIcons";

const useStyles = makeStyles(theme => ({
  expansionPanel: {
    marginBottom: "11px",
    borderRadius: "5px",
    boxShadow: "0px 0px 3px 1px rgba(0,0,0,0.2), 0px 1px 2px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
  },
  expansionHeading: {
    fontSize: "1rem",
    flexBasis: "33.33%",
    flexShrink: 0,
    fontWeight: "500",
    margin: "0"
  },
  expandMoreIcon: {
    color: "#0e6eff"
  }
}));

const GroupMessagesTable = ({ messages, title, showDeliveryStatus, showDeliveryDetails }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const columns = [
    {
      title: t("sender"),
      field: "createdBy"
    },
    {
      title: t("messageTemplateBody"),
      field: "messageTemplateBody",
      type: "string",
      render: row => formatMsgTemplate(row["messageTemplate"].body, row["messageRuleParams"]),
      cellStyle: {
        minWidth: 200,
        maxWidth: 550
      }
    }
  ];

  if (showDeliveryDetails) {
    columns.push({
      title: t("insertedAt"),
      field: "insertedAt",
      type: "date",
      render: row => formatDateTime(row["deliveredDateTime"]),
      defaultSort: "desc"
    });
  } else {
    columns.push({
      title: t("scheduledAt"),
      field: "scheduledAt",
      type: "date",
      render: row => formatDateTime(row["scheduledDateTime"]),
      defaultSort: "desc"
    });
  }

  return (
    <ExpansionPanel className={classes.expansionPanel}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}>
        <Typography component={"span"} className={classes.expansionHeading}>
          {t(title)}
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails style={{ padding: 0, display: "block" }}>
        <MaterialTable
          icons={materialTableIcons}
          title=""
          columns={columns}
          data={messages}
          options={{
            pageSize: 10,
            pageSizeOptions: [10, 15, 20],
            addRowPosition: "first",
            sorting: true,
            headerStyle: {
              zIndex: 1
            },
            debounceInterval: 500,
            search: false,
            toolbar: false
          }}
        />
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default GroupMessagesTable;
