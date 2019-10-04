import React, { Fragment } from "react";
import MaterialTable from "material-table";
import axios from "axios";
import _ from "lodash";
import { withRouter } from "react-router-dom";

const FormListing = ({ history }) => {
  const columns = [
    { title: "Name", field: "name" },
    { title: "Form Type", field: "formType", defaultSort: "asc" },
    { title: "Subject Name", field: "subjectName", sorting: false },
    {
      title: "Program Name",
      field: "programName",
      sorting: false,
      render: rowData => (rowData.programName ? rowData.programName : "-")
    }
  ];

  const tableRef = React.createRef();

  const fetchData = query =>
    new Promise(resolve => {
      let apiUrl = "/web/forms?";
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
            data: result._embedded ? result._embedded.basicFormDetailses : [],
            page: result.page.number,
            totalCount: result.page.totalElements
          });
        });
    });

  const editForm = rowData => ({
    icon: "edit",
    tooltip: "Edit Form",
    onClick: (event, form) => history.push(`/forms/${form.uuid}`)
  });

  return (
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
          backgroundColor: "#fff",
          width: "100%"
        })
      }}
      actions={[editForm]}
    />
  );
};

export default withRouter(FormListing);
