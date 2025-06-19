import React, { useState, useRef, useMemo, useCallback } from "react";
import http from "common/utils/httpClient";
import { isEqual, isEmpty } from "lodash";
import { withRouter, Redirect } from "react-router-dom";
import { Box } from "@mui/material";
import { Title } from "react-admin";
import { CreateComponent } from "../../common/components/CreateComponent";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { connect } from "react-redux";
import { Privilege } from "openchs-models";
import UserInfo from "../../common/model/UserInfo";
import { Edit, Delete } from "@mui/icons-material";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditConcept);
}

const Concepts = ({ history, userInfo }) => {
  const [redirect, setRedirect] = useState(false);
  const tableRef = useRef(null);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        enableSorting: true,
        Cell: ({ row }) => <a href={`#/appDesigner/concept/${row.original.uuid}/show`}>{row.original.name}</a>
      },
      {
        accessorKey: "dataType",
        header: "DataType"
      },
      {
        accessorKey: "organisationId",
        header: "OrganisationId",
        type: "number",
        muiTableBodyCellProps: { align: "right" }
      }
    ],
    []
  );

  const fetchData = useCallback(
    ({ page, pageSize, orderBy, orderDirection, globalFilter }) =>
      new Promise(resolve => {
        let apiUrl = `/web/concepts?size=${encodeURIComponent(pageSize)}&page=${encodeURIComponent(page)}`;
        if (!isEmpty(globalFilter)) {
          apiUrl += `&name=${encodeURIComponent(globalFilter)}`;
        }
        if (orderBy) {
          apiUrl += `&sort=${encodeURIComponent(orderBy)},${encodeURIComponent(orderDirection)}`;
        }
        http
          .get(apiUrl)
          .then(response => response.data)
          .then(result => {
            resolve({
              data: result._embedded?.concept || [],
              totalCount: result.page?.totalElements || 0
            });
          })
          .catch(error => {
            console.error("Failed to fetch concepts:", error);
            resolve({
              data: [],
              totalCount: 0
            });
          });
      }),
    []
  );

  const actions = useMemo(
    () =>
      hasEditPrivilege(userInfo)
        ? [
            {
              icon: Edit,
              tooltip: row => (row.original.organisationId === 1 ? "Can not edit core concepts" : "Edit Concept"),
              onClick: (event, row) => history.push(`/appdesigner/concept/${row.original.uuid}/edit`),
              disabled: row => row.original.organisationId === 1 || row.original.voided
            },
            {
              icon: Delete,
              tooltip: row => (row.original.organisationId === 1 ? "Can not delete core concepts" : "Delete Concept"),
              onClick: (event, row) => {
                const voidedMessage = `Do you want to delete the concept ${row.original.name}?`;
                if (window.confirm(voidedMessage)) {
                  http
                    .delete(`/concept/${row.original.uuid}`)
                    .then(response => {
                      if (response.status === 200 && tableRef.current) {
                        tableRef.current.refresh();
                      }
                    })
                    .catch(error => {
                      console.error("Failed to delete concept:", error);
                      alert("Failed to delete concept. Please try again.");
                    });
                }
              },
              disabled: row => row.original.organisationId === 1
            }
          ]
        : [],
    [history, userInfo, tableRef]
  );

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Concepts" color="primary" />
        <Box className="container">
          <Box component="div">
            <Box sx={{ float: "right", right: "50px", marginTop: "15px" }}>
              {hasEditPrivilege(userInfo) && <CreateComponent onSubmit={() => setRedirect(true)} name="New Concept" />}
            </Box>
            <AvniMaterialTable
              title=""
              ref={tableRef}
              columns={columns}
              fetchData={fetchData}
              options={{
                pageSize: 10,
                pageSizeOptions: [10, 15, 20],
                sorting: true,
                debounceInterval: 500,
                search: true,
                rowStyle: ({ original }) => ({
                  backgroundColor: original.voided ? "#DBDBDB" : "#fff"
                })
              }}
              actions={actions}
              route="/appdesigner/concepts"
            />
          </Box>
        </Box>
      </Box>
      {redirect && <Redirect to="/appdesigner/concept/create" />}
    </>
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default withRouter(connect(mapStateToProps)(Concepts));
