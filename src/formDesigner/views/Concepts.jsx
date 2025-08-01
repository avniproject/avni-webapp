import { memo, useState, useRef, useMemo, useCallback, useEffect } from "react";
import { httpClient as http } from "common/utils/httpClient";
import { isEqual, isEmpty } from "lodash";
import { useNavigate } from "react-router-dom";
import { Box, Grid } from "@mui/material";
import { Title } from "react-admin";
import { CreateComponent } from "../../common/components/CreateComponent";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { useSelector } from "react-redux";
import { Privilege } from "openchs-models";
import UserInfo from "../../common/model/UserInfo";
import { Edit, Delete } from "@mui/icons-material";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditConcept);
}

const Concepts = () => {
  const navigate = useNavigate();
  const userInfo = useSelector(state => state.app.userInfo);
  const [redirect, setRedirect] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    if (redirect) {
      navigate("/appdesigner/concept/create");
    }
  }, [redirect, navigate]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        enableSorting: true,
        Cell: ({ row }) => (
          <a href={`#/appDesigner/concept/${row.original.uuid}/show`}>
            {row.original.name}
          </a>
        )
      },
      {
        accessorKey: "dataType",
        header: "DataType"
      },
      {
        accessorKey: "organisationId",
        header: "Organization Id",
        type: "number"
      }
    ],
    []
  );

  const fetchData = useCallback(
    ({ page, pageSize, orderBy, orderDirection, globalFilter }) =>
      new Promise(resolve => {
        let apiUrl = `/web/concepts?size=${encodeURIComponent(
          pageSize
        )}&page=${encodeURIComponent(page)}`;
        if (!isEmpty(globalFilter)) {
          apiUrl += `&name=${encodeURIComponent(globalFilter)}`;
        }
        if (orderBy) {
          apiUrl += `&sort=${encodeURIComponent(orderBy)},${encodeURIComponent(
            orderDirection
          )}`;
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
              tooltip: row =>
                row.original.organisationId === 1
                  ? "Cannot edit core concepts"
                  : "Edit Concept",
              onClick: (event, row) =>
                navigate(`/appdesigner/concept/${row.original.uuid}/edit`),
              disabled: row =>
                row.original.organisationId === 1 || row.original.voided
            },
            {
              icon: Delete,
              tooltip: row =>
                row.original.organisationId === 1
                  ? "Cannot delete core concepts"
                  : "Delete Concept",
              onClick: (event, row) => {
                const voidedMessage = `Do you want to delete the concept ${
                  row.original.name
                }?`;
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
              disabled: row =>
                row.original.organisationId === 1 || row.original.voided
            }
          ]
        : [],
    [navigate, userInfo, tableRef]
  );

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Title title="Concepts" color="primary" />
      <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
        {hasEditPrivilege(userInfo) && (
          <Grid>
            <CreateComponent
              onSubmit={() => setRedirect(true)}
              name="New Concept"
            />
          </Grid>
        )}
      </Grid>
      <AvniMaterialTable
        title=""
        ref={tableRef}
        columns={columns}
        fetchData={fetchData}
        enableColumnFilters={false}
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
      {redirect && <div />}
    </Box>
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default memo(Concepts, areEqual);
