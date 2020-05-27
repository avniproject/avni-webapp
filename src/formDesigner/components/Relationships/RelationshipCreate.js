import React, { useEffect, useState } from "react";
import http from "common/utils/httpClient";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { SaveComponent } from "../../../common/components/SaveComponent";
import { cloneDeep } from "lodash";
import { Redirect } from "react-router-dom";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";

function RelationshipCreate() {
  const [relationshipName, setRelationshipName] = useState("");
  const [error, setError] = useState("");
  const [relationshipGenders, setRelationshipGenders] = useState([]);
  const [isIndividualSubjectTypeAvailable, setIsIndividualSubjectTypeAvailable] = useState(true);
  const [genders, setGenders] = useState([]);
  const [id, setId] = useState("");

  useEffect(() => {
    let flag = false;
    http
      .get("/web/subjectType")
      .then(response => {
        response.data._embedded.subjectType.forEach(subjectType => {
          if (subjectType.name.toLowerCase() === "individual") {
            flag = true;
          }
        });
        setIsIndividualSubjectTypeAvailable(flag);
      })
      .catch(error => {});

    http
      .get("/web/gender")
      .then(response => {
        setGenders(response.data.content);
      })
      .catch(error => {});
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

      http
        .post("/web/relation", {
          name: relationshipName,
          genders: genderToBesubmit
        })
        .then(response => {
          if (response.status === 200) {
            setId(response.data.id);
          }
        })
        .catch(error => {
          setError("existName");
        });
    } else {
      setError("emptyName");
    }
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Create Relationship"} />
        <DocumentationContainer filename={"Relationship.md"}>
          {!isIndividualSubjectTypeAvailable && (
            <div style={{ color: "red", size: "10" }}>
              Please create an Individual subject type to enable this screen{" "}
            </div>
          )}
          {error === "existName" && (
            <div style={{ color: "red", size: "6" }}>Same relationship is already present</div>
          )}
          {error === "emptyName" && (
            <div style={{ color: "red", size: "6" }}>Empty name is not allowed</div>
          )}

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
                  control={
                    <Checkbox
                      checked={relationshipGenders.includes(gender.name) ? true : false}
                      name={gender.name}
                    />
                  }
                  label={gender.name}
                  key={gender.uuid}
                  onClick={() => checkGender(gender.name)}
                />
              );
            })}
            <br />
            <SaveComponent
              name="save"
              onSubmit={() => onSubmitRelationship()}
              disabledFlag={!isIndividualSubjectTypeAvailable}
            />
          </div>
          {id !== "" && <Redirect to={"/appDesigner/relationship/" + id + "/show"} />}
        </DocumentationContainer>
      </Box>
    </>
  );
}

export default RelationshipCreate;
