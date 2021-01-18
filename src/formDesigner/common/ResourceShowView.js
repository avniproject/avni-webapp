import React, { useEffect, useState } from "react";
import http from "../../common/utils/httpClient";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import EditIcon from "@material-ui/icons/Edit";
import Box from "@material-ui/core/Box";
import { Redirect } from "react-router-dom";
import { Title } from "react-admin";

const ResourceShowView = ({ title, resourceId, resourceName, resourceURLName, renderColumns }) => {
  const [resource, setResource] = React.useState({});
  const [editAlert, setEditAlert] = useState(false);

  useEffect(() => {
    http.get(`/web/${resourceName}/${resourceId}`).then(res => setResource(res.data));
  }, []);

  return (
    <Box boxShadow={2} p={3} bgcolor="background.paper">
      <Title title={`Show ${title} : ${resource.name}`} />
      <Grid container item sm={12} style={{ justifyContent: "flex-end" }}>
        <Button color="primary" type="button" onClick={() => setEditAlert(true)}>
          <EditIcon />
          Edit
        </Button>
      </Grid>
      <div className="container" style={{ float: "left" }}>
        {renderColumns(resource)}
      </div>
      {editAlert && <Redirect to={`/appDesigner/${resourceURLName}/${resourceId}`} />}
    </Box>
  );
};

export default ResourceShowView;
