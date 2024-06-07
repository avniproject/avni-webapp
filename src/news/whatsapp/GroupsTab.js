import AddEditContactGroup from "./AddEditContactGroup";
import MaterialTable, { MTableToolbar } from "material-table";
import React, { Fragment, useCallback, useState } from "react";
import { LinearProgress, Snackbar } from "@material-ui/core";
import { MaterialTableToolBar, MaterialTableToolBarButton } from "../../common/material-table/MaterialTableToolBar";
import ContactService from "../api/ContactService";
import _ from "lodash";
import ErrorMessage from "../../common/components/ErrorMessage";
import materialTableIcons from "../../common/material-table/MaterialTableIcons";

const tableRef = React.createRef();

const GroupsTab = ({ groups, columns }) => {
  const [contactGroupsVersion, setContactGroupsVersion] = useState(1);
  const [addingContactGroup, setAddingContactGroup] = useState(false);
  const [savedContactGroup, setSavedContactGroup] = useState(false);
  const [displayProgress, setShowProgressBar] = useState(false);
  const [error, setError] = useState(null);

  const onContactSaved = useCallback(() => {
    setAddingContactGroup(false);
    setSavedContactGroup(true);
    setContactGroupsVersion(contactGroupsVersion + 1);
  }, [contactGroupsVersion]);

  const onDelete = useCallback(
    contactGroupRows => {
      ContactService.deleteContactGroup(contactGroupRows.map(x => x.id))
        .then(() => {
          setError(null);
          setContactGroupsVersion(contactGroupsVersion + 1);
        })
        .catch(error => setError(error))
        .finally(() => setShowProgressBar(false));
      setShowProgressBar(true);
    },
    [contactGroupsVersion]
  );

  return (
    <div className="container">
      {addingContactGroup && <AddEditContactGroup onClose={() => setAddingContactGroup(false)} onSave={() => onContactSaved()} />}
      {!_.isNil(error) && <ErrorMessage error={error} />}
      {displayProgress && <LinearProgress style={{ marginBottom: 30 }} />}
      <MaterialTable
        icons={materialTableIcons}
        key={contactGroupsVersion}
        title=""
        components={{
          Container: props => <Fragment>{props.children}</Fragment>,
          Toolbar: props => (
            <>
              <MaterialTableToolBar
                toolBarButtons={[
                  new MaterialTableToolBarButton(rows => onDelete(rows), true, "Delete"),
                  new MaterialTableToolBarButton(() => setAddingContactGroup(true), false, "Add Contact Group")
                ]}
                {...props}
              />
              <MTableToolbar {...props} />
            </>
          )
        }}
        tableRef={tableRef}
        columns={columns}
        data={groups}
        options={{
          search: true,
          searchFieldAlignment: "right",
          pageSize: 10,
          pageSizeOptions: [10, 15, 25],
          addRowPosition: "first",
          sorting: false,
          headerStyle: {
            zIndex: 1
          },
          debounceInterval: 500,
          filtering: false,
          selection: true,
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
    </div>
  );
};

export default GroupsTab;
