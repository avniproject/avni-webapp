import React, { useState } from "react";
import http from "common/utils/httpClient";
import _ from "lodash";
import { withRouter, Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import { CreateComponent } from "../../common/components/CreateComponent";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { connect } from "react-redux";
import { Privilege } from "openchs-models";
import UserInfo from "../../common/model/UserInfo";
import Edit from "@material-ui/icons/Edit";
import Delete from "@material-ui/icons/DeleteOutline";

const Concepts = ({ history, userInfo }) => {
  const columns = [
    {
      title: "Name",
      defaultSort: "asc",
      render: rowData => <a href={`#/appDesigner/concept/${rowData.uuid}/show`}>{rowData.name}</a>
    },
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
      if (!_.isEmpty(query.search)) apiUrl += "&name=" + encodeURIComponent(query.search);
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
    icon: () => <Delete />,
    tooltip: rowData.organisationId === 1 ? "Can not delete core concepts" : "Delete Concept",
    onClick: (event, rowData) => {
      const voidedMessage = "Do you want to delete the concept " + rowData.name + " ?";
      if (window.confirm(voidedMessage)) {
        http.delete(`/concept/${rowData.uuid}`).then(response => {
          if (response.status === 200) {
            refreshTable(tableRef);
          }
        });
      }
    },
    disabled: rowData.organisationId === 1
  });

  const editConcept = rowData => ({
    icon: () => <Edit />,
    tooltip: rowData.organisationId === 1 ? "Can not edit core concepts" : "Edit Concept",
    onClick: (event, concept) => history.push(`/appdesigner/concept/${concept.uuid}/edit`),
    disabled: rowData.organisationId === 1 || rowData.voided
  });

  const addNewConcept = () => {
    setRedirect(true);
  };

  const hasPrivilege = UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditConcept);
  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Concepts" />

        <div className="container">
          <div>
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              {hasPrivilege && <CreateComponent onSubmit={addNewConcept} name="New Concept" />}
            </div>
            <AvniMaterialTable
              title=""
              ref={tableRef}
              columns={columns}
              fetchData={fetchData}
              options={{
                pageSize: 10,
                pageSizeOptions: [10, 15, 20],
                addRowPosition: "first",
                sorting: true,
                debounceInterval: 500,
                searchFieldAlignment: "left",
                searchFieldStyle: { width: "100%", marginLeft: "-8%" },
                rowStyle: rowData => ({
                  backgroundColor: rowData["active"] ? "#fff" : "#DBDBDB"
                })
              }}
              actions={hasPrivilege && [editConcept, voidConcept]}
              route={"/appdesigner/concepts"}
            />
          </div>
        </div>
      </Box>
      {redirect && <Redirect to={"/appdesigner/concept/create"} />}
    </>
  );
};

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default withRouter(connect(mapStateToProps)(Concepts));
