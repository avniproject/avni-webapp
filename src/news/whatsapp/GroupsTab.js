import AddEditContactGroup from "./AddEditContactGroup";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import MaterialTable from "material-table";
import React, {Fragment, useState} from "react";
import {Snackbar} from "@material-ui/core";

const tableRef = React.createRef();

const GroupsTab = ({groups, columns}) => {
  const [addingContactGroup, setAddingContactGroup] = useState(false);
  const [savedContactGroup, setSavedContactGroup] = useState(false);

  return (<div className="container">
    {addingContactGroup && (
      <AddEditContactGroup
        onClose={() => setAddingContactGroup(false)}
        onSave={() => {
          setAddingContactGroup(false);
          setSavedContactGroup(true);
        }}
      />
    )}
    <Box style={{display: "flex", flexDirection: "row-reverse"}}>
      <Button
        color="primary"
        variant="outlined"
        style={{marginLeft: 10}}
        onClick={() => setAddingContactGroup(true)}
      >
        Add Contact Group
      </Button>
    </Box>
    <MaterialTable
      title=""
      components={{
        Container: props => <Fragment>{props.children}</Fragment>
      }}
      tableRef={tableRef}
      columns={columns}
      data={groups}
      options={{
        pageSize: 10,
        pageSizeOptions: [10, 15, 25],
        addRowPosition: "first",
        sorting: false,
        debounceInterval: 500,
        search: false,
        rowStyle: rowData => ({
          backgroundColor: "#fff"
        })
      }}
      actions={[]}
    />
    <Snackbar
      open={savedContactGroup}
      autoHideDuration={3000}
      onClose={() => setSavedContactGroup(false)}
      message="Created new contact group"
    />
  </div>)
}

export default GroupsTab;
