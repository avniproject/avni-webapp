import React, { Fragment } from "react";
import Box from "@material-ui/core/Box";
import MaterialTable from "material-table";
import { Title } from "react-admin";
import fetchData from "common/material-table/fetch";
import http from "common/utils/httpClient";
import moment from "moment";

const RuleFailureTelemetryList = () => {
  const columns = [
    {
      title: "Message",
      render: rowData => rowData.errorMessage
    },
    {
      title: "Individual UUID",
      render: rowData => rowData.individualUuid
    },
    {
      title: "Error Date",
      render: rowData => moment(rowData.errorDateTime).format("YYYY-MM-DD HH:mm")
    }
  ];

  const actions = [
    {
      tooltip: "Close All Selected Errors",
      icon: "delete",
      onClick: (evt, data) => {
        alert("You want to delete " + data.length + " rows");
        const request = {
          params: {
            ids: data.map(d => d.id).join(","),
            isClosed: true
          }
        };
        http.put("/web/ruleFailureTelemetry", null, request).then(() => refreshTable(tableRef));
      }
    }
  ];

  const tableRef = React.createRef();
  const refreshTable = ref => ref.current && ref.current.onQueryChange();

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Rule Failures" />
        <div className="container">
          <MaterialTable
            title=""
            components={{
              Container: props => <Fragment>{props.children}</Fragment>
            }}
            tableRef={tableRef}
            columns={columns}
            actions={actions}
            data={fetchData("/ruleFailureTelemetry")}
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
