import React, { useState, useRef, useMemo, useCallback } from "react";
import { isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import { Box } from "@mui/material";
import { CreateComponent } from "../../../common/components/CreateComponent";
import { Title } from "react-admin";
import http from "common/utils/httpClient";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import { connect } from "react-redux";
import { Edit, Delete } from "@mui/icons-material";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditVideo);
}

const VideoList = ({ history, userInfo }) => {
  const [redirect, setRedirect] = useState(false);
  const tableRef = useRef(null);

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Name",
        Cell: ({ row }) => !row.original.voided && <a href={`#/appDesigner/video/${row.original.id}/show`}>{row.original.title}</a>
      },
      {
        accessorKey: "description",
        header: "Description",
        Cell: ({ row }) => row.original.description
      },
      {
        accessorKey: "fileName",
        header: "Filename",
        Cell: ({ row }) => row.original.fileName
      },
      {
        accessorKey: "duration",
        header: "Duration",
        Cell: ({ row }) => row.original.duration
      }
    ],
    []
  );

  const fetchData = useCallback(
    ({ page, pageSize, orderBy, orderDirection }) =>
      new Promise(resolve => {
        let apiUrl = `/web/video?size=${encodeURIComponent(pageSize)}&page=${encodeURIComponent(page)}`;
        if (orderBy) {
          apiUrl += `&sort=${encodeURIComponent(orderBy)},${encodeURIComponent(orderDirection)}`;
        }
        http
          .get(apiUrl)
          .then(response => response.data)
          .then(result => {
            resolve({
              data: result.filter(({ voided }) => !voided) || [],
              totalCount: result.length || 0
            });
          })
          .catch(error => {
            console.error("Failed to fetch videos:", error);
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
              tooltip: "Edit video details",
              onClick: (event, row) => history.push(`/video/${row.original.id}`)
            },
            {
              icon: Delete,
              tooltip: "Delete Video",
              onClick: (event, row) => {
                const voidedMessage = `Do you really want to delete video ${row.original.title}?`;
                if (window.confirm(voidedMessage)) {
                  http
                    .delete(`/web/video/${row.original.id}`)
                    .then(response => {
                      if (response.status === 200 && tableRef.current) {
                        tableRef.current.refresh();
                      }
                    })
                    .catch(error => {
                      console.error("Failed to delete video:", error);
                      alert("Failed to delete video. Please try again.");
                    });
                }
              }
            }
          ]
        : [],
    [history, userInfo, tableRef]
  );

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Video Playlist" color="primary" />
        <Box className="container">
          <Box component="div">
            {hasEditPrivilege(userInfo) && (
              <Box sx={{ float: "right", right: "50px", marginTop: "15px" }}>
                <CreateComponent onSubmit={() => setRedirect(true)} name="New Video" />
              </Box>
            )}
            <AvniMaterialTable
              title=""
              ref={tableRef}
              columns={columns}
              fetchData={fetchData}
              options={{
                pageSize: 10,
                sorting: true,
                debounceInterval: 500,
                search: false,
                rowStyle: ({ original }) => ({
                  backgroundColor: original.voided ? "#DBDBDB" : "#fff"
                })
              }}
              actions={actions}
              route="/appdesigner/video"
            />
          </Box>
        </Box>
      </Box>
      {redirect && <Redirect to="/appDesigner/video/create" />}
    </>
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default withRouter(connect(mapStateToProps)(React.memo(VideoList, areEqual)));
