import React, { Fragment, useState } from "react";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import _ from "lodash";
import { withRouter, Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";

const Concepts = ({ history }) => {
  const columns = [
    { title: "Name", field: "name", defaultSort: "asc" },
    { title: "DataType", field: "dataType" },
    { title: "OrganisationId", field: "organisationId", type: "numeric" }
  ];

  const [redirect, setRedirect] = useState(false);

  const tableRef = React.createRef();
  const refreshTable = ref => ref.current && ref.current.onQueryChange();

  const fetchData = query =>
    new Promise(resolve => {
      let apiUrl = "/web/concepts?";
      apiUrl += "size=" + query.pageSize;
      apiUrl += "&page=" + query.page;
      if (!_.isEmpty(query.search)) apiUrl += "&name=" + query.search;
      if (!_.isEmpty(query.orderBy.field))
        apiUrl += `&sort=${query.orderBy.field},${query.orderDirection}`;
      http
        .get(apiUrl)
        .then(response => response.data)
        .then(result => {
          resolve({
            data: result._embedded ? result._embedded.concept : [],
            page: result.page.number,
            totalCount: result.page.totalElements
          });
        });
    });

  const voidConcept = rowData => ({
    icon: rowData.voided ? "restore_from_trash" : "delete_outline",
    tooltip:
      rowData.organisationId === 1
        ? "Can not void core concepts"
        : rowData.voided
        ? "Unvoid Concept"
        : "Void Concept",
    onClick: (event, rowData) => {
      console.log(rowData);
      const voidedMessage = rowData.voided
        ? "Do you want to unvoid the concept " + rowData.name + " ?"
        : "Do you want to void the concept " + rowData.name + " ?";
      if (window.confirm(voidedMessage)) {
        http
          .post("/concepts", [
            {
              uuid: rowData.uuid,
              voided: !rowData.voided
            }
          ])
          .then(response => {
            if (response.status === 200) {
              refreshTable(tableRef);
            }
          });
      }
    },
    disabled: rowData.organisationId === 1
  });

  const editConcept = rowData => ({
    icon: "edit",
    tooltip: rowData.organisationId === 1 ? "Can not edit core concepts" : "Edit Concept",
    onClick: (event, concept) => history.push(`/admin/concept/${concept.uuid}/edit`),
    disabled: rowData.organisationId === 1 || rowData.voided
  });

  const addNewConcept = () => {
    setRedirect(true);
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Concepts" />

        <div className="container">
          <div>
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              <Button variant="outlined" color="secondary" onClick={addNewConcept}>
                {" "}
                New Concept{" "}
              </Button>
            </div>

            <MaterialTable
              title=""
              components={{
                Container: props => <Fragment>{props.children}</Fragment>
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
                  backgroundColor: rowData["voided"] ? "#DBDBDB" : "#fff"
                })
              }}
              actions={[editConcept, voidConcept]}
            />
          </div>
        </div>
      </Box>
      {redirect && <Redirect to={"/admin/concept/create"} />}s
    </>
  );
};

export default withRouter(Concepts);
