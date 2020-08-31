import React, { Fragment, useEffect, useState } from "react";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import MaterialTable from "material-table";
import http from "../../../common/utils/httpClient";
import { makeStyles } from "@material-ui/core";
import { cloneDeep, get } from "lodash";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import { CreateComponent } from "../../../common/components/CreateComponent";
import Modal from "@material-ui/core/Modal";
import CircularProgress from "@material-ui/core/CircularProgress";
import CustomizedSnackbar from "../CustomizedSnackbar";

const useStyles = makeStyles(theme => ({
  progress: {
    position: "absolute",
    top: "30%",
    left: "50%",
    zIndex: 1
  }
}));

const ReportingViews = () => {
  const classes = useStyles();
  const tableRef = React.createRef();
  const columns = [{ title: "View Name", field: "viewName", searchable: true }];

  const [result, setResult] = useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(false);
  const [message, setMessage] = React.useState();

  useEffect(() => {
    http
      .get("/viewsInDb")
      .then(response => {
        const result = response.data;
        setResult(result);
      })
      .catch(error => console.log(error));
  }, []);

  const deleteView = rowData => ({
    icon: "delete_outline",
    tooltip: "Delete View",
    disabled: rowData.legacyView,
    onClick: (event, rowData) => {
      const voidedMessage = "Do you really want to delete view " + rowData.viewName + " ?";
      if (window.confirm(voidedMessage)) {
        http
          .delete("/reportingView/" + rowData.viewName)
          .then(response => {
            if (response.status === 200) {
              const index = result.indexOf(rowData);
              const clonedResult = cloneDeep(result);
              clonedResult.splice(index, 1);
              setResult(clonedResult);
            }
          })
          .catch(error => console.log(error));
      }
    }
  });

  const confirmViewCreation = () => {
    if (window.confirm("Are you sure you want to proceed with view creation/refresh?")) {
      setLoading(true);
      http
        .post("/createReportingViews")
        .then(res => {
          if (res.status === 200) {
            setResult(res.data);
            setLoading(false);
            setMessage("Successfully created the views");
            setShowAlert(true);
          }
        })
        .catch(error => {
          setLoading(false);
          const errorMessage = `${get(error, "response.data") ||
            get(error, "message") ||
            "unknown error"}`;
          setMessage(`Error occurred while creating views ${errorMessage}`);
          setShowAlert(true);
        });
    }
  };

  return (
    <Box boxShadow={2} p={5} bgcolor="background.paper">
      <Title title="Reporting Views" />
      <div className="container">
        <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
          <CreateComponent onSubmit={() => confirmViewCreation()} name="Create/Refresh view" />
        </div>
        <MaterialTable
          title=""
          components={{
            Container: props => <Fragment>{props.children}</Fragment>
          }}
          tableRef={tableRef}
          columns={columns}
          data={result}
          options={{
            addRowPosition: "first",
            pageSize: 10,
            pageSizeOptions: [10, 15, 20],
            sorting: true,
            debounceInterval: 500,
            searchFieldAlignment: "left",
            searchFieldStyle: { width: "100%", marginLeft: "-8%" },
            rowStyle: rowData => ({
              backgroundColor: rowData["legacyView"] ? "#DBDBDB" : "#FFF"
            })
          }}
          detailPanel={[
            {
              tooltip: "View definition",
              render: rowData => {
                return (
                  <Editor
                    readOnly
                    value={rowData.viewDefinition}
                    highlight={code => highlight(code, languages.js)}
                    padding={10}
                    style={{
                      fontFamily: '"Fira code", "Fira Mono", monospace',
                      fontSize: 12,
                      height: "auto",
                      border: "2px solid #6E6E6E"
                    }}
                  />
                );
              }
            }
          ]}
          actions={[deleteView]}
        />
      </div>
      <Modal disableBackdropClick open={loading}>
        <CircularProgress size={150} className={classes.progress} />
      </Modal>
      {showAlert && (
        <CustomizedSnackbar
          message={message}
          getDefaultSnackbarStatus={setShowAlert}
          defaultSnackbarStatus={showAlert}
        />
      )}
    </Box>
  );
};

export default ReportingViews;
