import React, { useEffect, useState } from "react";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import http from "../../../common/utils/httpClient";
import { makeStyles } from "@material-ui/core";
import { cloneDeep, get } from "lodash";
import { CreateComponent } from "../../../common/components/CreateComponent";
import Modal from "@material-ui/core/Modal";
import CircularProgress from "@material-ui/core/CircularProgress";
import CustomizedSnackbar from "../CustomizedSnackbar";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import Chip from "@material-ui/core/Chip";
import { JSEditor } from "../../../common/components/JSEditor";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { connect } from "react-redux";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";

const useStyles = makeStyles(theme => ({
  progress: {
    position: "absolute",
    top: "30%",
    left: "50%",
    zIndex: 1
  },
  chip: {
    color: "#FFF",
    backgroundColor: "#f50057",
    height: 20
  }
}));

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.Report);
}

const ReportingViews = ({ userInfo }) => {
  const classes = useStyles();
  const tableRef = React.createRef();
  const columns = [
    {
      title: "View Name",
      field: "viewName",
      searchable: true,
      render: rowData =>
        rowData.legacyView ? renderWarning(rowData.viewName) : <span>{rowData.viewName}</span>
    }
  ];

  const [result, setResult] = useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showAlert, setShowAlert] = React.useState(false);
  const [message, setMessage] = React.useState();

  useEffect(() => {
    http.get("/viewsInDb").then(response => {
      const result = response.data;
      setResult(result);
    });
  }, []);

  const deleteView = rowData => {
    return rowData.legacyView
      ? null
      : {
          icon: "delete_outline",
          tooltip: "Delete View",
          onClick: (event, rowData) => {
            const voidedMessage = "Do you really want to delete view " + rowData.viewName + " ?";
            if (window.confirm(voidedMessage)) {
              http.delete("/reportingView/" + rowData.viewName).then(response => {
                if (response.status === 200) {
                  const index = result.indexOf(rowData);
                  const clonedResult = cloneDeep(result);
                  clonedResult.splice(index, 1);
                  setResult(clonedResult);
                }
              });
            }
          }
        };
  };

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
          alert(errorMessage);
        });
    }
  };

  const renderWarning = viewName => (
    <span>
      {viewName}
      <Chip
        label={"Deprecated - Do not use"}
        style={{ display: "inline-block", marginLeft: "10px", marginBottom: "10px" }}
        className={classes.chip}
        labelStyle={{ verticalAlign: "top" }}
      />
    </span>
  );

  return (
    <Box boxShadow={2} p={5} bgcolor="background.paper">
      <Title title="Reporting Views" />
      <DocumentationContainer filename={"View.md"}>
        <div className="container">
          {hasEditPrivilege(userInfo) && (
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              <CreateComponent onSubmit={() => confirmViewCreation()} name="Create/Refresh view" />
            </div>
          )}
          <AvniMaterialTable
            title=""
            ref={tableRef}
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
                  return <JSEditor readOnly value={rowData.viewDefinition} />;
                }
              }
            ]}
            actions={hasEditPrivilege(userInfo) && [deleteView]}
            route={"/appdesigner/reportingViews"}
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
      </DocumentationContainer>
    </Box>
  );
};

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default connect(mapStateToProps)(ReportingViews);
