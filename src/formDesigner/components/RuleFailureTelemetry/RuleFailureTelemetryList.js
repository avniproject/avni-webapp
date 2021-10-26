import React, { Fragment } from "react";
import Box from "@material-ui/core/Box";
import MaterialTable from "material-table";
import { Title } from "react-admin";
import fetchData from "common/material-table/fetch";
import http from "common/utils/httpClient";
import moment from "moment";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

const tableRef = React.createRef();
const refreshTable = ref => ref.current && ref.current.onQueryChange();

const columns = [
  {
    title: "Message",
    field: "errorMessage",
    render: rowData => rowData.errorMessage
  },
  {
    title: "Error Date",
    field: "errorDateTime",
    render: rowData => moment(rowData.errorDateTime).format("YYYY-MM-DD HH:mm")
  },
  {
    title: "Closed Date",
    field: "closeDateTime",
    render: rowData => moment(rowData.closeDateTime).format("YYYY-MM-DD HH:mm")
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
  }
];

const actions = [
  {
    icon: "add",
    tooltip: "Add User",
    isFreeAction: true,
    onClick: () => alert("You want to add a new row")
  },
  {
    tooltip: "Close All Selected Errors",
    icon: "close",
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
    icon: "open",
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

const RuleFailureTelemetryList = () => {
  const [selectedBtn, setSelectedBtn] = React.useState("closed");

  const onSelect = label => {
    setSelectedBtn(label);
    refreshTable(tableRef);
  };

  let resourceUrl = "/ruleFailureTelemetry";
  let params = {};
  if (selectedBtn === "closed") {
    params.isClosed = true;
  } else if (selectedBtn === "open") {
    params.isClosed = false;
  } else if (selectedBtn === "all") {
    //Do nothing as we don't want to send any param when we are selecting all opiton
  }
  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Rule Failures" />
        <div className="container">
          <MaterialTable
            title=""
            components={{
              Container: props => <Fragment>{props.children}</Fragment>,
              Action: props =>
                props.action.icon === "close" ? (
                  <Button onClick={event => props.action.onClick(props.data)} color="primary">
                    Close Errors
                  </Button>
                ) : props.action.icon === "open" ? (
                  <Button onClick={event => props.action.onClick(props.data)} color="primary">
                    Reopen Errors
                  </Button>
                ) : (
                  <ButtonGroup color="primary">
                    <Button
                      style={{
                        backgroundColor: selectedBtn === "closed" ? "rgba(0, 0, 0, 0.12)" : null
                      }}
                      onClick={() => onSelect("closed")}
                    >
                      Closed
                    </Button>
                    <Button
                      style={{
                        backgroundColor: selectedBtn === "open" ? "rgba(0, 0, 0, 0.12)" : null
                      }}
                      onClick={() => onSelect("open")}
                    >
                      Open
                    </Button>
                    <Button
                      style={{
                        backgroundColor: selectedBtn === "all" ? "rgba(0, 0, 0, 0.12)" : null
                      }}
                      onClick={() => onSelect("all")}
                    >
                      All
                    </Button>
                  </ButtonGroup>
                )
            }}
            tableRef={tableRef}
            columns={columns}
            actions={actions}
            data={fetchData(resourceUrl, params)}
            detailPanel={rowData => {
              return <div>{rowData.stacktrace}</div>;
            }}
            onRowClick={(event, rowData, togglePanel) => togglePanel()}
            options={{
              selection: true,
              addRowPosition: "first",
              sorting: true,
              debounceInterval: 500,
              search: false,
              rowStyle: rowData => ({
                backgroundColor: rowData["voided"] ? "#DBDBDB" : "#fff"
              })
            }}
          />
        </div>
      </Box>
    </>
  );
};

export default RuleFailureTelemetryList;
