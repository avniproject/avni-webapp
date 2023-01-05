import React from "react";
import MaterialTable from "material-table";
import { isEmpty, map } from "lodash";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";

import {useHistory} from "react-router-dom";
import BroadcastPath from "../utils/BroadcastPath";

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
  let history = useHistory();

  const { selectedRows } = props;
  const selectedIds = map(selectedRows, "id");

  function navigateToComposeMessageComponent() {
    history.push(`/${BroadcastPath.Root}/${BroadcastPath.SendMessage}?groupIds=${selectedIds}`);
  }

  return (
    <div className={classes.root}>
      <Button
        variant="contained"
        color="primary"
        onClick={navigateToComposeMessageComponent}
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
