import React from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import MaterialTable from "material-table";

import Typography from "@material-ui/core/Typography";
import { formatDate } from "../../utils/General";

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
      title: t("Entity Type Id"),
      field: "entityTypeId"
    },
    {
      title: t("Entity Type"),
      field: "entityType"
    },
    {
      title: t("Receiver Id"),
      field: "receiverId"
    },
    {
      title: t("Receiver Type"),
      field: "receiverType"
    },
    {
      title: t("External Id"),
      field: "externalId"
    },
    {
      title: t("Delivery Status"),
      field: "deliveryStatus"
    },
    {
      title: t("Scheduled DateTime"),
      field: "scheduledDateTime",
      type: "date",
      render: row => formatDate(row.scheduledDateTime),
      defaultSort: "desc"
    },
    {
      title: t("Message Template Name"),
      field: "messageTemplateName"
    },
    {
      title: t("Message Template Id"),
      field: "messageTemplateId"
    }
  ];

  const renderNoMsgsYetToBeSent = () => (
    <Typography variant="caption" gutterBottom className={classes.infoMsg}>
      {" "}
      {t("No")} {t("messages")} {t("yet")} {t("to")} {t("be")} {t("sent")}
    </Typography>
  );

  const renderTable = () => (
    <MaterialTable
      title=""
      columns={columns}
      data={msgsYetToBeSent}
      options={{
        pageSize: 10,
        pageSizeOptions: [10, 15, 20],
        addRowPosition: "first",
        sorting: true,
        debounceInterval: 500,
        search: false,
        toolbar: false
      }}
    />
  );

  return isMsgsNotYetSentAvailable ? renderTable() : renderNoMsgsYetToBeSent();
};
export default YetToBeSentMessagesTable;
