import React, { useEffect, useState } from "react";
import http from "../../../common/utils/httpClient";
import { Grid } from "@mui/material";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import { Redirect } from "react-router-dom";
import { Title } from "react-admin";
import { ShowLabelValue } from "../../common/ShowLabelValue";
import { connect } from "react-redux";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";

const VideoShow = props => {
  const [video, setVideo] = React.useState({});
  const [editAlert, setEditAlert] = useState(false);

  useEffect(() => {
    http.get(`/web/video/${props.match.params.id}`).then(res => setVideo(res.data));
  }, []);

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper"
      }}
    >
      <Title title={"Show Video : " + video.title} />
      {UserInfo.hasPrivilege(props.userInfo, Privilege.PrivilegeType.EditVideo) && (
        <Grid
          container
          style={{ justifyContent: "flex-end" }}
          size={{
            sm: 12
          }}
        >
          <Button color="primary" type="button" onClick={() => setEditAlert(true)}>
            <EditIcon />
            Edit
          </Button>
        </Grid>
      )}
      <div className="container" style={{ float: "left" }}>
        <ShowLabelValue label={"Name"} value={video.title} />
        <p />
        <ShowLabelValue label={"Description"} value={video.description} />
        <p />
        <ShowLabelValue label={"File name"} value={video.fileName} />
        <p />
        <ShowLabelValue label={"Duration"} value={video.duration} />
        <p />
      </div>
      {editAlert && <Redirect to={"/appDesigner/video/" + props.match.params.id} />}
    </Box>
  );
};

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default connect(mapStateToProps)(VideoShow);
