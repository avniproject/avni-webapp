import React, { useEffect, useState } from "react";
import http from "../../common/utils/httpClient";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import { Redirect } from "react-router-dom";
import { Title } from "react-admin";
import _ from "lodash";
import UserInfo from "../../common/model/UserInfo";

const ResourceShowView = ({
  title,
  resourceId,
  resourceName,
  resourceURLName,
  render,
  mapResource = _.identity,
  userInfo,
  editPrivilegeType,
  defaultResource
}) => {
  const [resource, setResource] = React.useState(defaultResource);
  const [editAlert, setEditAlert] = useState(false);

  useEffect(() => {
    http.get(`/web/${resourceName}/${resourceId}`).then(res => setResource(mapResource(res.data)));
  }, []);

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper"
      }}
    >
      <Title title={`Show ${title} : ${resource.name}`} />
      {UserInfo.hasPrivilege(userInfo, editPrivilegeType) && (
        <Grid container item sm={12} style={{ justifyContent: "flex-end" }}>
          <Button color="primary" type="button" onClick={() => setEditAlert(true)}>
            <EditIcon />
            Edit
          </Button>
        </Grid>
      )}
      <div className="container" style={{ float: "left" }}>
        {render(resource)}
      </div>
      {editAlert && <Redirect to={`/appDesigner/${resourceURLName}/${resourceId}`} />}
    </Box>
  );
};

export default ResourceShowView;
