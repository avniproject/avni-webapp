import React from "react";
import MaterialTable from "material-table";
import ButtonAppBar from "./CommonHeader";
import axios from "axios";
import _ from "lodash";

function Concepts() {
  const columns = [
    { title: "Name", field: "name", defaultSort: "asc" },
    { title: "DataType", field: "dataType" },
    { title: "OrganisationId", field: "organisationId", type: "numeric" }
  ];
  const tableRef = React.createRef();
  return (
    <div>
      <ButtonAppBar title="Concepts List" />
      <MaterialTable
        title=""
        tableRef={tableRef}
        columns={columns}
        data={query =>
          new Promise(resolve => {
            let url = "/web/concept?";
            url += "size=" + query.pageSize;
            url += "&page=" + query.page;
            if (!_.isEmpty(query.search)) url += "&name=" + query.search;
            if (!_.isEmpty(query.orderBy.field))
              url += `&sort=${query.orderBy.field},${query.orderDirection}`;
            fetch(url)
              .then(response => response.json())
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
          sorting: true
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
          })
        ]}
      />
    </div>
  );
}

export default Concepts;
