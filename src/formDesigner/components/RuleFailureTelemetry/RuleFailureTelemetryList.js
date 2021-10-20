import React, { Fragment } from "react";
import Box from "@material-ui/core/Box";
import MaterialTable from "material-table";
import { Title } from "react-admin";
import fetchData from "common/material-table/fetch";

const RuleFailureTelemetryList = () => {
  const columns = [
    {
      title: "Closed",
      render: rowData => (rowData.closed ? "True" : "False")
    },
    {
      title: "Message",
      render: rowData => rowData.errorMessage
    },
    {
      title: "Stacktrace",
      render: rowData => rowData.stacktrace
    }
  ];

  const tableRef = React.createRef();

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
            data={fetchData("/ruleFailureTelemetry")}
            options={{
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
