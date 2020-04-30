import React, { useEffect, useState } from "react";
import EditIcon from "@material-ui/icons/Edit";
import http from "common/utils/httpClient";
import { Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import Moment from "react-moment";
import Grid from "@material-ui/core/Grid";

const RelationshipShow = props => {
  const [editAlert, setEditAlert] = useState(false);

  const [relationship, setRelationship] = useState({});

  useEffect(() => {
    http
      .get("/web/relation/" + props.match.params.id)
      .then(response => {
        console.log(response);
      })
      .catch(error => {});
  }, []);

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Show relationship : "} />
        <Grid container item sm={12} style={{ justifyContent: "flex-end" }}>
          <Button color="primary" type="button" onClick={() => setEditAlert(true)}>
            <EditIcon />
            Edit
          </Button>
        </Grid>
        <div className="container" style={{ float: "left" }} />

        {editAlert && <Redirect to={"/appDesigner/relationship/" + props.match.params.id} />}
      </Box>
    </>
  );
};

export default RelationshipShow;
