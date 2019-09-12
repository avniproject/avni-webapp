import React, { Fragment } from "react";
import MaterialTable from "material-table";
import axios from "axios";
import _ from "lodash";
import { withRouter } from "react-router-dom";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";

const Concepts = ({ history }) => {
  const columns = [
    { title: "Name", field: "name", defaultSort: "asc" },
    { title: "DataType", field: "dataType" },
    { title: "OrganisationId", field: "organisationId", type: "numeric" }
  ];

  const tableRef = React.createRef();
  return (
    <ScreenWithAppBar appbarTitle="Concepts List" enableLeftMenuButton={true}>
      <MaterialTable
        title=""
        components={{
          Container: props => <Fragment>{props.children}</Fragment>
        }}
        tableRef={tableRef}
        columns={columns}
        data={query =>
          new Promise(resolve => {
            let apiUrl = "/web/concepts?";
            apiUrl += "size=" + query.pageSize;
            apiUrl += "&page=" + query.page;
            if (!_.isEmpty(query.search)) apiUrl += "&name=" + query.search;
            if (!_.isEmpty(query.orderBy.field))
              apiUrl += `&sort=${query.orderBy.field},${query.orderDirection}`;
            axios
              .get(apiUrl)
              .then(response => response.data)
              .then(result => {
                resolve({
                  data: result._embedded ? result._embedded.concept : [],
                  page: result.page.number,
                  totalCount: result.page.totalElements
                });
              });
          })
        }
        options={{
          pageSize: 10,
          pageSizeOptions: [10, 15, 20],
          addRowPosition: "first",
          sorting: true,
          debounceInterval: 500,
          searchFieldAlignment: "left",
          searchFieldStyle: { width: "100%" },
          rowStyle: rowData => ({
            backgroundColor: rowData["voided"] === false ? "#fff" : "#DBDBDB"
          })
        }}
        actions={[
          rowData => ({
            icon: rowData.voided ? "restore_from_trash" : "delete_outline",
            tooltip:
              rowData.organisationId === 1
                ? "Can not void core concepts"
                : rowData.voided
                ? "Unvoid Concept"
                : "Void Concept",
            onClick: (event, rowData) => {
              axios
                .post("/concepts", [
                  {
                    uuid: rowData.uuid,
                    voided: !rowData.voided
                  }
                ])
                .then(response => {
                  if (response.status === 200) {
                    tableRef.current && tableRef.current.onQueryChange();
                  }
                });
            },
            disabled: rowData.organisationId === 1
          }),
          rowData => ({
            icon: "edit",
            tooltip: rowData.organisationId === 1 ? "Can not edit core concepts" : "Edit Concept",
            onClick: (event, concept) => history.push(`/concept/${concept.uuid}/edit`),
            disabled: rowData.organisationId === 1 || rowData.voided === true
          }),
          {
            icon: "add",
            tooltip: "Create Concept",
            isFreeAction: true,
            onClick: event => history.push(`/concept/create`)
          }
        ]}
      />
    </ScreenWithAppBar>
  );
};

export default withRouter(Concepts);
