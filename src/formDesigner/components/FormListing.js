import { useState, useRef, useMemo, useCallback } from "react";
import { httpClient as http } from "common/utils/httpClient";
import { withRouter } from "react-router-dom";
import { FormTypeEntities } from "../common/constants";
import { Dialog, DialogTitle, DialogContent, IconButton, Grid } from "@mui/material";
import { Close, Edit, LibraryAdd, Settings, Delete } from "@mui/icons-material";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import NewFormModal from "../components/NewFormModal";
import { format, isValid } from "date-fns";
import UserInfo from "../../common/model/UserInfo";
import { connect } from "react-redux";
import { CreateComponent } from "../../common/components/CreateComponent";
import { Title } from "react-admin";

function isActionDisabled(rowData, userInfo) {
  // prettier-ignore
  return (rowData?.voided ?? false) || !UserInfo.hasFormEditPrivilege(userInfo, rowData?.formType);
}

const FormListing = ({ history, userInfo, onNewFormClick }) => {
  const [cloneFormIndicator, setCloneFormIndicator] = useState(false);
  const [uuid, setUUID] = useState(0);
  const tableRef = useRef(null);

  const onCloseEvent = useCallback(() => {
    setCloneFormIndicator(false);
  }, []);

  const onSetUuidAndIndicator = useCallback((value, uuid) => {
    setUUID(uuid);
    setCloneFormIndicator(value);
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        enableSorting: true
      },
      {
        accessorKey: "formType",
        header: "Form Type",
        Cell: ({ row }) => {
          const display = FormTypeEntities[row.original.formType]?.display;
          return typeof display === "string" ? display : "-";
        }
      },
      {
        accessorKey: "subjectName",
        header: "Subject Name",
        Cell: ({ row }) => (row.original.subjectName ? row.original.subjectName : "-")
      },
      {
        accessorKey: "programName",
        header: "Program Name",
        Cell: ({ row }) => (row.original.programName ? row.original.programName : "-")
      },
      {
        accessorKey: "taskTypeName",
        header: "Task Type",
        Cell: ({ row }) => (row.original.taskTypeName ? row.original.taskTypeName : "-")
      },
      {
        accessorKey: "lastModifiedDateTime",
        header: "Last Modified",
        enableSorting: true,
        Cell: ({ row }) =>
          row.original.lastModifiedDateTime && isValid(new Date(row.original.lastModifiedDateTime))
            ? format(new Date(row.original.lastModifiedDateTime), "d/M/yyyy h:mm a")
            : "-"
      }
    ],
    []
  );

  const fetchData = useCallback(
    ({ page, pageSize, orderBy, orderDirection, globalFilter }) =>
      new Promise(resolve => {
        const validSortFields = ["name", "lastModifiedDateTime"];
        let apiUrl = `/web/forms?size=${encodeURIComponent(pageSize)}&page=${encodeURIComponent(page)}`;
        if (globalFilter) apiUrl += `&name=${encodeURIComponent(globalFilter)}`;
        if (orderBy && validSortFields.includes(orderBy)) {
          apiUrl += `&sort=${encodeURIComponent(orderBy)},${encodeURIComponent(orderDirection)}`;
        }
        http
          .get(apiUrl)
          .then(response => response.data)
          .then(result => {
            const forms = (result._embedded?.basicFormDetailses || []).map(form => ({
              ...form,
              voided: form.voided ?? form.isVoided ?? false
            }));
            resolve({
              data: forms,
              totalCount: result.page?.totalElements || 0
            });
          })
          .catch(error => {
            console.error("Failed to fetch forms:", error);
            resolve({
              data: [],
              totalCount: 0
            });
          });
      }),
    []
  );

  const actions = useMemo(
    () => [
      {
        icon: Edit,
        tooltip: "Edit Form",
        onClick: (event, row) => history.push(`/appdesigner/forms/${row.original.uuid}`),
        disabled: row => isActionDisabled(row.original, userInfo)
      },
      {
        icon: LibraryAdd,
        tooltip: "Clone Form",
        onClick: (event, row) => onSetUuidAndIndicator(true, row.original.uuid),
        disabled: row => isActionDisabled(row.original, userInfo)
      },
      {
        icon: Settings,
        tooltip: "Form Setting",
        onClick: (event, row) => history.push(`/appdesigner/forms/${row.original.uuid}/settings`),
        disabled: row => isActionDisabled(row.original, userInfo)
      },
      {
        icon: Delete,
        tooltip: row => (row.original?.voided ? "Unvoid Form" : "Delete Form"),
        onClick: (event, row) => {
          const voidedMessage = row.original?.voided
            ? `Do you want to unvoid the form ${row.original.name}?`
            : `Do you want to delete the form ${row.original.name}?`;
          if (window.confirm(voidedMessage)) {
            http
              .delete(`/web/forms/${row.original.uuid}`)
              .then(response => {
                if (response.status === 200 && tableRef.current) {
                  tableRef.current.refresh();
                }
              })
              .catch(error => {
                console.error("Failed to delete/unvoid form:", error);
                alert("Failed to delete/unvoid form. Please try again.");
              });
          }
        },
        disabled: row => isActionDisabled(row.original, userInfo)
      }
    ],
    [history, userInfo, onSetUuidAndIndicator]
  );

  const showCloneForm = useCallback(() => {
    return (
      <Dialog fullWidth maxWidth="xs" onClose={onCloseEvent} aria-labelledby="customized-dialog-title" open={cloneFormIndicator}>
        <DialogTitle id="customized-dialog-title" onClose={onCloseEvent}>
          Clone Form
          <IconButton style={{ float: "right" }} onClick={onCloseEvent} size="large">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <NewFormModal isCloneForm={true} uuid={uuid} />
        </DialogContent>
      </Dialog>
    );
  }, [cloneFormIndicator, uuid, onCloseEvent]);

  return (
    <>
      <Title title="Forms" color="primary" />
      <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
        {UserInfo.hasFormEditPrivilege(userInfo) && (
          <Grid item>
            <CreateComponent onSubmit={onNewFormClick} name="New Form" />
          </Grid>
        )}
      </Grid>
      <AvniMaterialTable
        title=""
        ref={tableRef}
        columns={columns}
        fetchData={fetchData}
        options={{
          pageSize: 10,
          pageSizeOptions: [10, 15, 20],
          sorting: true,
          debounceInterval: 500,
          search: true,
          rowStyle: ({ original }) => ({
            backgroundColor: original?.voided ?? false ? "#DBDBDB" : "#fff"
          }),
          maxWidth: "100%"
        }}
        route="/appdesigner/forms"
        actions={actions}
      />
      {cloneFormIndicator && showCloneForm()}
    </>
  );
};

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default withRouter(connect(mapStateToProps)(FormListing));
