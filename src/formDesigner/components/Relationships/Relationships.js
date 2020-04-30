import React, { Fragment, useState } from "react";
import MaterialTable from "material-table";
import http from "common/utils/httpClient";
import { get, isEmpty, isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import { CreateComponent } from "../../../common/components/CreateComponent";

const Relationships = ({ history }) => {
  const columns = [
    {
      title: "Name",
      render: rowData => (
        <a href={`#/appDesigner/relationship/${rowData.id}/show`}>{rowData.name}</a>
      )
    },
    {
      title: "Genders",
      render: rowData =>
        rowData.genders.map(gender => {
          return gender.name + ", ";
        })
    }
  ];

  const [redirect, setRedirect] = useState(false);

  const tableRef = React.createRef();
  const refreshTable = ref => ref.current && ref.current.onQueryChange();

  const fetchData = query =>
    new Promise(resolve => {
      let apiUrl = "/web/relation/";
      // apiUrl += "size=" + query.pageSize;
      // apiUrl += "&page=" + query.page;
      // if (!isEmpty(query.orderBy.field))
      //   apiUrl += `&sort=${query.orderBy.field},${query.orderDirection}`;
      http
        .get(apiUrl)
        .then(response => response.data)
        .then(result => {
          console.log(JSON.stringify(result));
          resolve({
            data: result ? result : []
            // page: result.page.number,
            // totalCount: result.page.totalElements
          });
        });
    });

  const addNewConcept = () => {
    setRedirect(true);
  };
  const editRelationship = rowData => ({
    icon: "edit",
    tooltip: "Edit relarionship",
    onClick: event => history.push(`/appDesigner/relationship/${rowData.id}`),
    disabled: rowData.voided
  });

  const voidRelationship = rowData => ({
    icon: "delete_outline",
    tooltip: "Void relationship"
    // onClick: (event, rowData) => {
    //   const voidedMessage = "Do you really want to void the relationship" + rowData.name + " ?";
    //   if (window.confirm(voidedMessage)) {
    //     http
    //       .delete("/web/encounterType/" + rowData.id)
    //       .then(response => {
    //         if (response.status === 200) {
    //           refreshTable(tableRef);
    //         }
    //       })
    //       .catch(error => {});
    //   }
    // }
  });

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Relationships" />

        <div className="container">
          <div>
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              <CreateComponent onSubmit={addNewConcept} name="New Relationship" />
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
                addRowPosition: "first",
                sorting: true,
                debounceInterval: 500,
                search: false,
                rowStyle: rowData => ({
                  backgroundColor: rowData["voided"] ? "#DBDBDB" : "#fff"
                })
              }}
              actions={[editRelationship, voidRelationship]}
            />
          </div>
        </div>
      </Box>
      {redirect && <Redirect to={"/appDesigner/relationship/create"} />}
    </>
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default withRouter(React.memo(Relationships, areEqual));
