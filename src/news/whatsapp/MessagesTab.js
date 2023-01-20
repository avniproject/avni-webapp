import React, {useState} from "react";
import MaterialTable from "material-table";
import { isEmpty, map } from "lodash";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";

import ComposeMessageView from "./ComposeMessageView";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";

const useStyle = makeStyles(theme => ({
  root: {
    margin: "10px",
    paddingTop: "10px",
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end"
  }
}));

const SendMessageToolBar = ({ ...props }) => {
  const classes = useStyle();
  const [sendingMessage, setSendingMessage] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  const { selectedRows } = props;
  const selectedIds = map(selectedRows, "id");

  const onSchedulingAttempted = (status) => {
    setSendingMessage(false)
    setScheduled(status)
  }

  return (
    <div className={classes.root}>
      {sendingMessage && <ComposeMessageView selectedGroupIds={selectedIds}
                                             onClose={() => setSendingMessage(false)}
                                             onSchedulingAttempted={onSchedulingAttempted}
      />}

      {scheduled && <CustomizedSnackbar
        variant={scheduled}
        message={scheduled === "success" ? "Message scheduling successful" : "Message scheduling failed"}
        getDefaultSnackbarStatus={snackbarStatus =>
          setScheduled(snackbarStatus)
        }
        defaultSnackbarStatus={scheduled}/>}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setSendingMessage(true)}
        disabled={isEmpty(selectedIds)}
      >
        {"Send Message"}
      </Button>
    </div>
  );
};

const MessagesTab = ({ groups, columns }) => {
  return (
    <div className="container">
      <MaterialTable
        title=""
        columns={columns}
        data={groups}
        components={{
          Toolbar: props => <SendMessageToolBar {...props} />
        }}
        options={{
          pageSize: 10,
          pageSizeOptions: [10, 15, 25],
          addRowPosition: "first",
          sorting: false,
          debounceInterval: 500,
          search: false,
          selection: true,
          rowStyle: rowData => ({
            backgroundColor: "#fff"
          })
        }}
        actions={[]}
      />
    </div>
  );
};

export default MessagesTab;
