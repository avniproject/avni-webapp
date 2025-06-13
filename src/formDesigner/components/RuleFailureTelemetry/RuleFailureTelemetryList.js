import React, { Fragment } from "react";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import fetchData from "common/material-table/fetch";
import http from "common/utils/httpClient";
import moment from "moment";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { connect } from "react-redux";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import { Close, MenuOpen } from "@mui/icons-material";

const tableRef = React.createRef();
const refreshTable = ref => ref.current && ref.current.onQueryChange({ page: 0 });

const STATUS = {
  OPEN: 1,
  CLOSED: 2,
  ALL: 3
};

function renderIdAndType(id, type) {
  return rowData => (
    <Fragment>
      <span>{rowData[id] || ""}</span>
      <b>{rowData[type] ? " (" + rowData[type] + ")" : ""}</b>
    </Fragment>
  );
}

const columns = [
  {
    title: "Message",
    field: "errorMessage",
    render: rowData => rowData.errorMessage
  },
  {
    title: "Status",
    field: "isClosed",
    render: rowData => (rowData.closed ? "Closed" : "Open")
  },
  {
    title: "Error Date",
    field: "errorDateTime",
    render: rowData => moment(rowData.errorDateTime).format("YYYY-MM-DD HH:mm")
  },
  {
    title: "Closed Date",
    field: "closedDateTime",
    render: rowData => rowData.closedDateTime && moment(rowData.closedDateTime).format("YYYY-MM-DD HH:mm")
  },
  {
    title: "Individual UUID",
    field: "individualUuid",
    render: rowData => rowData.individualUuid
  },
  {
    title: "Rule UUID",
    field: "ruleUuid",
    render: rowData => rowData.ruleUuid
  },
  {
    title: "Source",
    field: "sourceId",
    render: renderIdAndType("sourceId", "sourceType")
  },
  {
    title: "Entity",
    field: "entityId",
    render: renderIdAndType("entityId", "entityType")
  },
  {
    title: "App",
    field: "appType",
    render: rowData => rowData.appType
  }
];

const buildActions = () => [
  {
    tooltip: "Status",
    isFreeAction: true
  },
  {
    tooltip: "Close All Selected Errors",
    name: "CloseSelected",
    icon: () => <Close />,
    onClick: (evt, data) => {
      const request = {
        params: {
          ids: data.map(d => d.id).join(","),
          isClosed: true
        }
      };
      http.put("/web/ruleFailureTelemetry", null, request).then(() => refreshTable(tableRef));
    }
  },
  {
    tooltip: "Reopen All Selected Errors",
    name: "ReopenSelected",
    icon: () => <MenuOpen />,
    onClick: (evt, data) => {
      const request = {
        params: {
          ids: data.map(d => d.id).join(","),
          isClosed: false
        }
      };
      http.put("/web/ruleFailureTelemetry", null, request).then(() => refreshTable(tableRef));
    }
  }
];

const statusFilter = (selectedStatus, onSelect) => (
  <ButtonGroup color="primary">
    <Button
      style={{
        backgroundColor: selectedStatus === STATUS.OPEN ? "rgba(0, 0, 0, 0.12)" : null
      }}
      onClick={() => onSelect(STATUS.OPEN)}
    >
      Open
    </Button>
    <Button
      style={{
        backgroundColor: selectedStatus === STATUS.CLOSED ? "rgba(0, 0, 0, 0.12)" : null
      }}
      onClick={() => onSelect(STATUS.CLOSED)}
    >
      Closed
    </Button>
    <Button
      style={{
        backgroundColor: selectedStatus === STATUS.ALL ? "rgba(0, 0, 0, 0.12)" : null
      }}
      onClick={() => onSelect(STATUS.ALL)}
    >
      All
    </Button>
  </ButtonGroup>
);

const RuleFailureTelemetryList = ({ userInfo }) => {
  const [selectedStatus, setSelectedStatus] = React.useState(STATUS.OPEN);

  const onSelect = label => {
    setSelectedStatus(label);
    refreshTable(tableRef);
  };

  const resourceUrl = "/ruleFailureTelemetry";
  const resourceName = "ruleFailureTelemetries";
  let queryParams = {};
  if (selectedStatus === STATUS.CLOSED) {
    queryParams.isClosed = true;
  } else if (selectedStatus === STATUS.OPEN) {
    queryParams.isClosed = false;
  } else if (selectedStatus === STATUS.ALL) {
    //Do nothing as we don't need to send any param when we are selecting all filter
  }
  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Rule Failures" />
        <div className="container">
          <AvniMaterialTable
            title=""
            components={{
              Container: props => <Fragment>{props.children}</Fragment>,
              Action: props => {
                return (
                  UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditRuleFailure) &&
                  (props.action.name === "CloseSelected" ? (
                    <Button
                      onClick={event => props.action.onClick(event, props.data)}
                      disabled={selectedStatus === STATUS.CLOSED}
                      color="primary"
                    >
                      Close Errors
                    </Button>
                  ) : props.action.name === "ReopenSelected" ? (
                    <Button
                      onClick={event => props.action.onClick(event, props.data)}
                      color="primary"
                      disabled={selectedStatus === STATUS.OPEN}
                    >
                      Reopen Errors
                    </Button>
                  ) : (
                    statusFilter(selectedStatus, onSelect)
                  ))
                );
              }
            }}
            ref={tableRef}
            columns={columns}
            actions={buildActions()}
            data={fetchData(resourceName, resourceUrl, queryParams)}
            detailPanel={[
              {
                tooltip: "Show Stacktrace",
                render: rowData => {
                  return <div>{rowData.stacktrace}</div>;
                }
              }
            ]}
            onRowClick={(event, rowData, togglePanel) => togglePanel()}
            options={{
              selection: true,
              addRowPosition: "first",
              sorting: true,
              debounceInterval: 500,
              search: false,
              rowStyle: rowData => ({
                backgroundColor: rowData["closed"] ? "#DBDBDB" : "#fff"
              })
            }}
            route={"/appdesigner/ruleFailures"}
          />
        </div>
      </Box>
    </>
  );
};

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default connect(mapStateToProps)(RuleFailureTelemetryList);
