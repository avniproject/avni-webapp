import React, { useEffect, useState } from "react";
import http from "common/utils/httpClient";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { SaveComponent } from "../../../common/components/SaveComponent";
import { cloneDeep, get } from "lodash";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Redirect } from "react-router-dom";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";

function RelationshipEdit(props) {
  const [relationshipName, setRelationshipName] = useState("");
  const [error, setError] = useState("");
  const [uuid, setUUID] = useState("");
  const [relationshipGenders, setRelationshipGenders] = useState([]);
  const [isIndividualSubjectTypeAvailable, setIsIndividualSubjectTypeAvailable] = useState(true);
  const [genders, setGenders] = useState([]);
  const [redirectShow, setRedirectShow] = useState(false);
  const [redirectAfterDelete, setRedirectAfterDelete] = useState(false);

  useEffect(() => {
    http.get("/web/subjectType").then(response => {
      const subjectTypes = get(response, "data._embedded.subjectType");
      subjectTypes &&
        subjectTypes.forEach(subjectType => {
          if (subjectType.type === "Person") {
            setIsIndividualSubjectTypeAvailable(true);
          }
        });
    });

    http.get("/web/gender").then(response => {
      setGenders(response.data.content);
    });

    http.get("/web/relation/" + props.match.params.id).then(response => {
      const gender = response.data.genders.map(l => l.name);
      setRelationshipGenders(gender);
      setRelationshipName(response.data.name);
      setUUID(response.data.uuid);
    });
  }, []);

  const checkGender = gender => {
    if (relationshipGenders.includes(gender)) {
      const clonedRelationshipGenders = cloneDeep(relationshipGenders);
      const genderIndex = clonedRelationshipGenders.indexOf(gender);
      clonedRelationshipGenders.splice(genderIndex, 1);
      setRelationshipGenders(clonedRelationshipGenders);
    } else {
      setRelationshipGenders([...relationshipGenders, gender]);
    }
  };

  const onSubmitRelationship = () => {
    if (relationshipName.trim() !== "") {
      const genderToBesubmit = [];
      genders.forEach(gender => {
        if (relationshipGenders.includes(gender.name)) {
          genderToBesubmit.push(gender);
        }
      });

      return http
        .post("/web/relation/" + props.match.params.id, {
          name: relationshipName,
          uuid: uuid,
          genders: genderToBesubmit
        })
        .then(response => {
          if (response.status === 200) {
            setRedirectShow(true);
          }
        });
    } else {
      setError("emptyName");
    }
  };

  const onDeleteRelationship = () => {
    if (window.confirm("Do you really want to delete relationship?")) {
      http.delete("/web/relation/" + props.match.params.id).then(response => {
        if (response.status === 200) {
          setRedirectAfterDelete(true);
        }
      });
    }
  };

  return (
    <>
      <Box
        sx={{
          boxShadow: 2,
          p: 3,
          bgcolor: "background.paper"
        }}
      >
        <Title title={"Edit Relationship"} />
        <DocumentationContainer filename={"Relationship.md"}>
          <Grid container item={12} style={{ justifyContent: "flex-end" }}>
            <Button color="primary" type="button" onClick={() => setRedirectShow(true)}>
              <VisibilityIcon /> Show
            </Button>
          </Grid>
          {!isIndividualSubjectTypeAvailable && (
            <div style={{ color: "red", size: "10" }}>Go to subject type and please create Person subject type </div>
          )}
          {error === "existName" && <div style={{ color: "red", size: "6" }}>Same relationship is already present</div>}
          {error === "emptyName" && <div style={{ color: "red", size: "6" }}>Empty name is not allowed</div>}
          <TextField
            id="name"
            label="Name*"
            autoComplete="off"
            value={relationshipName}
            onChange={event => setRelationshipName(event.target.value)}
          />
          <div style={{ marginTop: "1%" }}>
            Genders
            <br />
            {genders.map(gender => {
              return (
                <FormControlLabel
                  control={<Checkbox checked={relationshipGenders.includes(gender.name) ? true : false} name={gender.name} />}
                  label={gender.name}
                  key={gender.uuid}
                  onClick={() => checkGender(gender.name)}
                />
              );
            })}
            <br />
          </div>
          <Grid container item sm={12}>
            <Grid item sm={1}>
              <SaveComponent name="save" onSubmit={() => onSubmitRelationship()} disabledFlag={!setIsIndividualSubjectTypeAvailable} />{" "}
            </Grid>
            <Grid item sm={11}>
              <Button style={{ float: "right", color: "red" }} onClick={() => onDeleteRelationship()}>
                <DeleteIcon /> Delete
              </Button>
            </Grid>
          </Grid>
        </DocumentationContainer>
      </Box>
      {redirectShow && <Redirect to={`/appDesigner/relationship/${props.match.params.id}/show`} />}
      {redirectAfterDelete && <Redirect to="/appDesigner/relationship" />}
    </>
  );
}
export default RelationshipEdit;
