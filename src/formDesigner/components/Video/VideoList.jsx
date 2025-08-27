import { memo, useState, useRef, useMemo, useCallback } from "react";
import { isEqual } from "lodash";
import { Navigate, useNavigate } from "react-router-dom";
import { Box, Grid } from "@mui/material";
import { Title } from "react-admin";
import { CreateComponent } from "../../../common/components/CreateComponent";
import { httpClient as http } from "common/utils/httpClient";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import { useSelector } from "react-redux";
import { Edit, Delete } from "@mui/icons-material";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditVideo);
}

const VideoList = () => {
  const [redirect, setRedirect] = useState(false);
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.app.userInfo);

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Name",
        Cell: ({ row }) =>
          !row.original.voided && (
            <a href={`#/appDesigner/video/${row.original.id}/show`}>
              {row.original.title}
            </a>
          ),
      },
      {
        accessorKey: "description",
        header: "Description",
        Cell: ({ row }) => row.original.description,
      },
      {
        accessorKey: "fileName",
        header: "Filename",
        Cell: ({ row }) => row.original.fileName,
      },
      {
        accessorKey: "duration",
        header: "Duration",
        Cell: ({ row }) => row.original.duration,
      },
    ],
    [],
  );

  const fetchData = useCallback(
    ({ page, pageSize, orderBy, orderDirection }) =>
      new Promise((resolve) => {
        let apiUrl = `/web/video?size=${encodeURIComponent(
          pageSize,
        )}&page=${encodeURIComponent(page)}`;
        if (orderBy) {
          apiUrl += `&sort=${encodeURIComponent(orderBy)},${encodeURIComponent(
            orderDirection,
          )}`;
        }
        http
          .get(apiUrl)
          .then((response) => response.data)
          .then((result) => {
            resolve({
              data: result.filter(({ voided }) => !voided) || [],
              totalCount: result.length || 0,
            });
          })
          .catch((error) => {
            console.error("Failed to fetch videos:", error);
            resolve({
              data: [],
              totalCount: 0,
            });
          });
      }),
    [],
  );

  const actions = useMemo(
    () =>
      hasEditPrivilege(userInfo)
        ? [
            {
              icon: Edit,
              tooltip: "Edit video details",
              onClick: (event, row) => navigate(`${row.original.id}`),
            },
            {
              icon: Delete,
              tooltip: "Delete Video",
              onClick: (event, row) => {
                const voidedMessage = `Do you really want to delete video ${
                  row.original.title
                }?`;
                if (window.confirm(voidedMessage)) {
                  http
                    .delete(`/web/video/${row.original.id}`)
                    .then((response) => {
                      if (response.status === 200 && tableRef.current) {
                        tableRef.current.refresh();
                      }
                    })
                    .catch((error) => {
                      console.error("Failed to delete video:", error);
                      alert("Failed to delete video. Please try again.");
                    });
                }
              },
            },
          ]
        : [],
    [navigate, userInfo, tableRef],
  );

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Title title="Video Playlist" />
      <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
        {hasEditPrivilege(userInfo) && (
          <Grid>
            <CreateComponent
              onSubmit={() => setRedirect(true)}
              name="New Video"
            />
          </Grid>
        )}
      </Grid>
      <AvniMaterialTable
        title=""
        ref={tableRef}
        columns={columns}
        fetchData={fetchData}
        enableGlobalFilter={false}
        enableColumnFilters={false}
        options={{
          pageSize: 10,
          pageSizeOptions: [5, 10, 20],
          sorting: true,
          debounceInterval: 500,
          search: false,
          rowStyle: ({ original }) => ({
            backgroundColor: original.voided ? "#DBDBDB" : "#fff",
          }),
        }}
        actions={actions}
        route="/appdesigner/video"
      />
      {redirect && <Navigate to="/appDesigner/video/create" />}
    </Box>
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default memo(VideoList, areEqual);
