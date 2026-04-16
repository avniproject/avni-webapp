import { useCallback, useMemo, useRef } from "react";
import { httpClient as http } from "common/utils/httpClient";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Grid } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import UserInfo from "../../../common/model/UserInfo";
import { CreateComponent } from "../../../common/components/CreateComponent";
import { Title } from "react-admin";
import { Privilege } from "openchs-models";

const CustomCardConfigList = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.app.userInfo);
  const tableRef = useRef(null);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        enableSorting: true,
        Cell: ({ row }) =>
          !row.original.voided && (
            <a
              href={`#/appDesigner/customCardConfig/${row.original.uuid}/show`}
            >
              {row.original.name}
            </a>
          ),
      },
      {
        accessorKey: "htmlFileS3Key",
        header: "HTML File",
        Cell: ({ row }) => row.original.htmlFileS3Key || "-",
      },
    ],
    [navigate],
  );

  const fetchData = useCallback(
    ({ page, pageSize, orderBy, orderDirection }) =>
      new Promise((resolve) => {
        http
          .get("/web/customCardConfig")
          .then((response) => {
            let data = Array.isArray(response.data) ? response.data : [];
            data = data.filter((item) => !item.voided);
            if (orderBy) {
              data = [...data].sort((a, b) => {
                const aValue = a[orderBy] ?? "";
                const bValue = b[orderBy] ?? "";
                const cmp = String(aValue).localeCompare(String(bValue));
                return orderDirection === "asc" ? cmp : -cmp;
              });
            }
            const start = page * pageSize;
            resolve({
              data: data.slice(start, start + pageSize),
              totalCount: data.length,
            });
          })
          .catch((error) => {
            console.error("Failed to fetch custom card configs:", error);
            resolve({ data: [], totalCount: 0 });
          });
      }),
    [],
  );

  const hasEditPrivilege = UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.EditOfflineDashboardAndReportCard,
  );

  const actions = useMemo(
    () =>
      hasEditPrivilege
        ? [
            {
              icon: Edit,
              tooltip: "Edit Custom Card Config",
              onClick: (event, row) =>
                navigate(`/appDesigner/customCardConfig/${row.original.uuid}`),
              disabled: (row) => row.original.voided ?? false,
            },
            {
              icon: Delete,
              tooltip: "Delete Custom Card Config",
              onClick: (event, row) => {
                if (
                  window.confirm(
                    `Do you really want to delete ${row.original.name}?`,
                  )
                ) {
                  http
                    .delete(`/web/customCardConfig/${row.original.uuid}`)
                    .then((response) => {
                      if (response.status === 200 && tableRef.current) {
                        tableRef.current.refresh();
                      }
                    })
                    .catch((error) => {
                      console.error(
                        `Failed to delete custom card config ${row.original.uuid}:`,
                        error,
                      );
                      alert(
                        error?.response?.data ||
                          "Failed to delete. Please try again.",
                      );
                    });
                }
              },
              disabled: (row) => row.original.voided ?? false,
            },
          ]
        : [],
    [navigate, hasEditPrivilege],
  );

  return (
    <>
      <Title title="Custom Card Config" color="primary" />
      <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
        {hasEditPrivilege && (
          <Grid>
            <CreateComponent
              onSubmit={() => navigate("/appDesigner/customCardConfig/create")}
              name="New Custom Card Config"
            />
          </Grid>
        )}
      </Grid>
      <AvniMaterialTable
        title=""
        ref={tableRef}
        columns={columns}
        fetchData={fetchData}
        options={{
          pageSize: 10,
          pageSizeOptions: [10, 25, 100],
          sorting: true,
          rowStyle: ({ original }) => ({
            backgroundColor: original.voided ? "#DBDBDB" : "#fff",
          }),
        }}
        actions={actions}
        route="/appDesigner/customCardConfig"
      />
    </>
  );
};

export default CustomCardConfigList;
