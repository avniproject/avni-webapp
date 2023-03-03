import React from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { formatDate } from "../../utils/General";
import MaterialTable from "material-table";

import Typography from "@material-ui/core/Typography";

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

const SentMessagesTable = ({ sentMessages, isMsgsSentAvailable }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const columns = [
    {
      title: t("Sender Id"),
      field: "senderId",
      render: row => row.sender.id
    },
    {
      title: t("Sender Name"),
      field: "senderName",
      render: row => row.sender.name
    },
    {
      title: t("Receiver Id"),
      field: "receiverId",
      render: row => row.receiver.id
    },
    {
      title: t("Receiver Name"),
      field: "receiverName",
      render: row => row.receiver.name
    },
    {
      title: t("Type"),
      field: "type"
    },
    {
      title: t("Body"),
      field: "body"
    },
    {
      title: t("Inserted At"),
      field: "insertedAt",
      type: "date",
      render: row => formatDate(row.insertedAt),
      defaultSort: "desc"
    }
  ];

  const renderNoSentMessages = () => (
    <Typography variant="caption" gutterBottom className={classes.infoMsg}>
      {" "}
      {t("No")} {t("sent")} {t("messages")}{" "}
    </Typography>
  );

  const renderTable = () => (
    <MaterialTable
      title=""
      columns={columns}
      data={sentMessages}
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

  return isMsgsSentAvailable ? renderTable() : renderNoSentMessages();
};
export default SentMessagesTable;
