import { useEffect, useState } from "react";
import { httpClient as http } from "../../../common/utils/httpClient";
import { Grid } from "@mui/material";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import { Navigate, useParams } from "react-router-dom";
import { Title } from "react-admin";
import { ShowLabelValue } from "../../common/ShowLabelValue";
import { useSelector } from "react-redux";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";

const VideoShow = () => {
  const [video, setVideo] = useState({});
  const [editAlert, setEditAlert] = useState(false);
  const { id } = useParams();
  const userInfo = useSelector(state => state.app.userInfo);

  useEffect(() => {
    http
      .get(`/web/video/${id}`)
      .then(res => setVideo(res.data))
      .catch(error => {
        console.error("Failed to fetch video:", error);
      });
  }, [id]);

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper"
      }}
    >
      <Title title={"Show Video : " + video.title} />
      {UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditVideo) && (
        <Grid
          container
          style={{ justifyContent: "flex-end" }}
          size={{
            sm: 12
          }}
        >
          <Button
            color="primary"
            type="button"
            onClick={() => setEditAlert(true)}
          >
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
      {editAlert && <Navigate to={`/appDesigner/video/${id}`} />}
    </Box>
  );
};

export default VideoShow;
