import React, { Fragment, useState } from "react";
import MaterialTable, { MTableToolbar } from "material-table";
import http from "common/utils/httpClient";
import _ from "lodash";
import { withRouter } from "react-router-dom";
import { constFormType } from "../common/constants";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import NewFormModal from "../components/NewFormModal";

const FormListing = ({ history }) => {
  const [cloneFormIndicator, setCloneFormIndicator] = useState(false);
  const [uuid, setUUID] = useState(0);
  const [includeVoided, setIncludeVoided] = useState(false);

  const onCloseEvent = () => {
    setCloneFormIndicator(false);
  };

  const onSetUuidAndIndicator = (value, uuid) => {
    setUUID(uuid);
    setCloneFormIndicator(value);
  };
  const columns = [
    { title: "Name", field: "name" },
    {
      title: "Form Type",
      field: "formType",
      defaultSort: "asc",
      render: rowData => constFormType[rowData.formType]
    },
    { title: "Subject Name", field: "subjectName", sorting: false },
    {
      title: "Program Name",
      field: "programName",
      sorting: false,
      render: rowData => (rowData.programName ? rowData.programName : "-")
    }
  ];

  const tableRef = React.createRef();
  const refreshTable = ref => ref.current && ref.current.onQueryChange();

  const fetchData = query =>
    new Promise(resolve => {
      let apiUrl = "/web/forms?";
      apiUrl += "size=" + query.pageSize;
      apiUrl += "&page=" + query.page;
      if (!_.isEmpty(query.search)) apiUrl += "&name=" + query.search;
      apiUrl += "&includeVoided=" + includeVoided;
      if (!_.isEmpty(query.orderBy.field))
        apiUrl += `&sort=${query.orderBy.field},${query.orderDirection}`;
      http
        .get(apiUrl)
        .then(response => response.data)
        .then(result => {
          resolve({
            data: result._embedded ? result._embedded.basicFormDetailses : [],
            page: result.page.number,
            totalCount: result.page.totalElements
          });
        });
    });

  const editForm = rowData => ({
    icon: "edit",
    tooltip: "Edit Form",
    onClick: (event, form) => history.push(`/appdesigner/forms/${form.uuid}`),
    disabled: rowData.voided
  });

  const formSettings = rowData => ({
    icon: "settings",
    tooltip: "Form Setting",
    onClick: (event, form) => history.push(`/appdesigner/forms/${form.uuid}/settings`),
    disabled: rowData.voided
  });

  const showCloneForm = () => {
    return (
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={onCloseEvent}
        aria-labelledby="customized-dialog-title"
        open={cloneFormIndicator}
      >
        <DialogTitle id="customized-dialog-title" onClose={onCloseEvent}>
          Clone Form
          <IconButton style={{ float: "right" }} onClick={onCloseEvent}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <NewFormModal isCloneForm={true} uuid={uuid} />
        </DialogContent>
      </Dialog>
    );
  };
  const cloneForm = rowData => ({
    icon: "library_add",
    tooltip: "Clone Form",
    onClick: (event, form) => onSetUuidAndIndicator(true, rowData["uuid"]),
    disabled: rowData.voided
  });

  const voidForm = rowData => ({
    icon: rowData.voided ? "restore_from_trash" : "delete_outline",
    tooltip: rowData.voided ? "Unvoid Form" : "Void Form",
    onClick: (event, rowData) => {
      const voidedMessage = rowData.voided
        ? "Do you want to unvoid the form " + rowData.name + " ?"
        : "Do you want to void the form " + rowData.name + " ?";
      if (window.confirm(voidedMessage)) {
        http.delete("/web/forms/" + rowData.uuid).then(response => {
          if (response.status === 200) {
            refreshTable(tableRef);
          }
        });
      }
    },
    disabled: rowData.organisationId === 1
  });

  const handleChangeFitlerVoided = name => event => {
    setIncludeVoided(event.target.checked);
    tableRef.current.onQueryChange();
  };

  return (
    <>
      <MaterialTable
        title=""
        components={{
          Container: props => <Fragment>{props.children}</Fragment>,
          Toolbar: props => (
            <>
              <MTableToolbar {...props} />
              <div style={{ marginLeft: "15px" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeVoided}
                      onChange={handleChangeFitlerVoided("voided")}
                      value="voided"
                    />
                  }
                  label="Include voided forms"
                />
              </div>
            </>
          )
        }}
        tableRef={tableRef}
        columns={columns}
        data={fetchData}
        options={{
          pageSize: 10,
          pageSizeOptions: [10, 15, 20],
          addRowPosition: "first",
          sorting: true,
          debounceInterval: 500,
          searchFieldAlignment: "left",
          searchFieldStyle: { width: "100%", marginLeft: "-8%" },
          rowStyle: rowData => ({
            backgroundColor: "#fff",
            width: "100%"
          })
        }}
        actions={[editForm, cloneForm, formSettings, voidForm]}
      />
      {cloneFormIndicator && showCloneForm()}
    </>
  );
};

export default withRouter(FormListing);
