import React, { useEffect, useState } from "react";
import http from "../../../common/utils/httpClient";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import EditIcon from "@material-ui/icons/Edit";
import FormLabel from "@material-ui/core/FormLabel";
import Box from "@material-ui/core/Box";
import { Redirect } from "react-router-dom";
import { Title } from "react-admin";

export const VideoShow = props => {
  const [video, setVideo] = React.useState({});
  const [editAlert, setEditAlert] = useState(false);

  useEffect(() => {
    http.get(`/web/video/${props.match.params.id}`).then(res => setVideo(res.data));
  }, []);

  const renderField = (label, value) => {
    return (
      <div>
        <FormLabel style={{ fontSize: "13px" }}>{label}</FormLabel>
        <br />
        <span style={{ fontSize: "15px" }}>{value}</span>
      </div>
    );
  };
  return (
    <Box boxShadow={2} p={3} bgcolor="background.paper">
      <Title title={"Show Video : " + video.title} />
      <Grid container item sm={12} style={{ justifyContent: "flex-end" }}>
        <Button color="primary" type="button" onClick={() => setEditAlert(true)}>
          <EditIcon />
          Edit
        </Button>
      </Grid>
      <div className="container" style={{ float: "left" }}>
        {renderField("Name", video.title)}
        <p />
        {renderField("Description", video.description)}
        <p />
        {renderField("File name", video.fileName)}
        <p />
        {renderField("Duration", video.duration)}
        <p />
      </div>
      {editAlert && <Redirect to={"/appDesigner/video/" + props.match.params.id} />}
    </Box>
  );
};
