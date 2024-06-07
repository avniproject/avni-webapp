import React from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import MaterialTable from "material-table";

import Typography from "@material-ui/core/Typography";
import { formatDateTime } from "../../utils/General";
import { formatMsgTemplate } from "../utils";
import materialTableIcons from "../../material-table/MaterialTableIcons";

const useStyles = makeStyles(theme => ({
  labelStyle: {
    color: "red",
    backgroundColor: "#ffeaea",
    fontSize: "12px",
    alignItems: "center",
    margin: 0
  },
  infoMsg: {
    marginLeft: 10
  }
}));

const YetToBeSentMessagesTable = ({ msgsYetToBeSent, isMsgsNotYetSentAvailable }) => {
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
    },
    {
      title: t("scheduledAt"),
      field: "scheduledAt",
      type: "date",
      render: row => formatDateTime(row.scheduledDateTime),
      defaultSort: "desc"
    }
  ];

  const renderNoMsgsYetToBeSent = () => (
    <Typography variant="caption" gutterBottom className={classes.infoMsg}>
      {" "}
      {t("noMessagesYetToBeSent")}{" "}
    </Typography>
  );

  const renderTable = () => (
    <MaterialTable
      icons={materialTableIcons}
      title=""
      columns={columns}
      data={msgsYetToBeSent}
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
  );

  return isMsgsNotYetSentAvailable ? renderTable() : renderNoMsgsYetToBeSent();
};
export default YetToBeSentMessagesTable;
