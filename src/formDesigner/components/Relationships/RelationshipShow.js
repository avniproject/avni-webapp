import React, { useEffect, useState } from "react";
import EditIcon from "@material-ui/icons/Edit";
import http from "common/utils/httpClient";
import { Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";

const RelationshipShow = props => {
  const [editAlert, setEditAlert] = useState(false);
  const [relationshipGenders, setRelationshipGenders] = useState([]);
  const [relationship, setRelationship] = useState({});
  const [genders, setGenders] = useState([]);

  useEffect(() => {
    http
      .get("/web/relation/" + props.match.params.id)
      .then(response => {
        console.log(response);
        setRelationship(response.data);
        const gender = response.data.genders.map(l => l.name);
        setRelationshipGenders(gender);
      })
      .catch(error => {});

    http
      .get("/web/gender")
      .then(response => {
        setGenders(response.data.content);
      })
      .catch(error => {});
  }, []);

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Show Relationship : " + relationship.name} />
        <DocumentationContainer filename={"Relationship.md"}>
          <Grid container item sm={12} style={{ justifyContent: "flex-end" }}>
            <Button color="primary" type="button" onClick={() => setEditAlert(true)}>
              <EditIcon />
              Edit
            </Button>
          </Grid>
          <div className="container" style={{ float: "left" }}>
            <div>
              <FormLabel style={{ fontSize: "13px" }}>Name</FormLabel>
              <br />
              <span style={{ fontSize: "15px" }}>{relationship.name}</span>
            </div>
            <p />
            <div>
              <FormLabel style={{ fontSize: "13px" }}>Genders</FormLabel>
              <br />

              {genders.map(gender => {
                return (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={relationshipGenders.includes(gender.name) ? true : false}
                        name={gender.name}
                      />
                    }
                    label={gender.name}
                    key={gender.uuid}
                    disabled={true}
                  />
                );
              })}
            </div>
            <p />
          </div>

          {editAlert && <Redirect to={"/appDesigner/relationship/" + props.match.params.id} />}
        </DocumentationContainer>
      </Box>
    </>
  );
};

export default RelationshipShow;
