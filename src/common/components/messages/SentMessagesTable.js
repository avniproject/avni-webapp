import React from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "../../utils/General";
import MaterialTable from "material-table";

import Typography from "@material-ui/core/Typography";
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

const SentMessagesTable = ({ sentMessages, isMsgsSentAvailable }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const columns = [
    {
      title: t("msgBody"),
      field: "body",
      cellStyle: {
        minWidth: 200,
        maxWidth: 550
      }
    },
    {
      title: t("insertedAt"),
      field: "insertedAt",
      type: "date",
      render: row => formatDateTime(row.insertedAt),
      defaultSort: "desc"
    }
  ];

  const renderNoSentMessages = () => (
    <Typography variant="caption" gutterBottom className={classes.infoMsg}>
      {" "}
      {t("noSentMessages")}{" "}
    </Typography>
  );

  const renderTable = () => (
    <MaterialTable
      icons={materialTableIcons}
      title=""
      columns={columns}
      data={sentMessages}
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

  return isMsgsSentAvailable ? renderTable() : renderNoSentMessages();
};
export default SentMessagesTable;
