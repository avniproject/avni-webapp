import React, { Fragment, useEffect, useState } from "react";
import { cloneDeep, isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { CreateComponent } from "../../../common/components/CreateComponent";
import MaterialTable from "material-table";
import { Title } from "react-admin";
import http from "common/utils/httpClient";

export const VideoList = ({ history }) => {
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
  const [redirect, setRedirect] = useState(false);
  const [result, setResult] = useState([]);
  const tableRef = React.createRef();

  useEffect(() => {
    http
      .get("/web/video")
      .then(response => {
        const result = response.data.filter(({ voided }) => !voided);
        setResult(result);
      })
      .catch(error => console.log(error));
  }, []);

  const editVideo = rowData => ({
    icon: "edit",
    tooltip: "Edit video details",
    onClick: event => history.push(`/video/${rowData.id}`)
  });

  const voidVideo = rowData => ({
    icon: "delete_outline",
    tooltip: "Delete Video",
    onClick: (event, rowData) => {
      const voidedMessage = "Do you really want to delete video " + rowData.title + " ?";
      if (window.confirm(voidedMessage)) {
        http
          .delete("/web/video/" + rowData.id)
          .then(response => {
            if (response.status === 200) {
              const index = result.indexOf(rowData);
              const clonedResult = cloneDeep(result);
              clonedResult.splice(index, 1);
              setResult(clonedResult);
            }
          })
          .catch(error => error => console.log(error));
      }
    }
  });

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Video Playlist" />
        <div className="container">
          <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
            <CreateComponent onSubmit={() => setRedirect(true)} name="New Video" />
          </div>
          <MaterialTable
            title=""
            components={{
              Container: props => <Fragment>{props.children}</Fragment>
            }}
            tableRef={tableRef}
            columns={columns}
            data={result}
            options={{
              addRowPosition: "first",
              sorting: true,
              debounceInterval: 500,
              search: false,
              rowStyle: rowData => ({
                backgroundColor: rowData["voided"] ? "#DBDBDB" : "#fff"
              })
            }}
            actions={[editVideo, voidVideo]}
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

export default withRouter(React.memo(VideoList, areEqual));
