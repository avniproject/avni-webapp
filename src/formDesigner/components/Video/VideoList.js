import React, { useEffect, useState } from "react";
import { cloneDeep, isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { CreateComponent } from "../../../common/components/CreateComponent";
import { Title } from "react-admin";
import http from "common/utils/httpClient";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import { connect } from "react-redux";
import Edit from "@material-ui/icons/Edit";
import Delete from "@material-ui/icons/DeleteOutline";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditVideo);
}

const columns = [
  {
    title: "Name",
    render: rowData =>
      !rowData.voided && <a href={`#/appDesigner/video/${rowData.id}/show`}>{rowData.title}</a>
  },
  {
    title: "Description",
    render: rowData => rowData.description
  },
  {
    title: "Filename",
    render: rowData => rowData.fileName
  },
  {
    title: "Duration",
    render: rowData => rowData.duration
  }
];

const VideoList = ({ history, userInfo }) => {
  const [redirect, setRedirect] = useState(false);
  const [result, setResult] = useState([]);
  const tableRef = React.createRef();

  useEffect(() => {
    http.get("/web/video").then(response => {
      const result = response.data.filter(({ voided }) => !voided);
      setResult(result);
    });
  }, []);

  const editVideo = rowData => ({
    icon: () => <Edit />,
    tooltip: "Edit video details",
    onClick: event => history.push(`/video/${rowData.id}`)
  });

  const voidVideo = rowData => ({
    icon: () => <Delete />,
    tooltip: "Delete Video",
    onClick: (event, rowData) => {
      const voidedMessage = "Do you really want to delete video " + rowData.title + " ?";
      if (window.confirm(voidedMessage)) {
        http.delete("/web/video/" + rowData.id).then(response => {
          if (response.status === 200) {
            const index = result.indexOf(rowData);
            const clonedResult = cloneDeep(result);
            clonedResult.splice(index, 1);
            setResult(clonedResult);
          }
        });
      }
    }
  });

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Video Playlist" />
        <div className="container">
          {hasEditPrivilege(userInfo) && (
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              <CreateComponent onSubmit={() => setRedirect(true)} name="New Video" />
            </div>
          )}
          <AvniMaterialTable
            title=""
            ref={tableRef}
            columns={columns}
            fetchData={result}
            options={{
              addRowPosition: "first",
              sorting: true,
              debounceInterval: 500,
              search: false,
              rowStyle: rowData => ({
                backgroundColor: rowData["voided"] ? "#DBDBDB" : "#fff"
              })
            }}
            actions={hasEditPrivilege(userInfo) && [editVideo, voidVideo]}
            route={"/appdesigner/video"}
          />
        </div>
      </Box>
      {redirect && <Redirect to={"/appDesigner/video/create"} />}
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
