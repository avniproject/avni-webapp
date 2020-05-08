import React, { useEffect, useState } from "react";
import http from "common/utils/httpClient";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import _, { isEmpty } from "lodash";
import { SaveComponent } from "../../../common/components/SaveComponent";
import { Redirect } from "react-router-dom";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";

function RelationshipTypeCreate() {
  const [individualAIsToBRelation, setIndividualAIsToBRelation] = useState({});
  const [individualBIsToARelation, setIndividualBIsToARelation] = useState({});
  const [error, setError] = useState({
    individualAIsToBRelationError: "",
    individualBIsToARelationError: ""
  });
  const [relations, setRelations] = useState([]);
  const [redirect, setRedirect] = useState(false);

  const [isIndividualSubjectTypeAvailable, setIsIndividualSubjectTypeAvailable] = useState(true);

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
      .get("/web/relation")
      .then(response => {
        const filterVoidedRelations = response.data.filter(relation => !relation.voided);
        setRelations(filterVoidedRelations);
      })
      .catch(error => {});
  }, []);

  const onSubmitRelationshipType = () => {
    if (!isEmpty(individualAIsToBRelation) && !isEmpty(individualBIsToARelation)) {
      http
        .post("/web/relationshipType", {
          individualAIsToBRelation: {
            id: individualAIsToBRelation.id
          },
          individualBIsToARelation: {
            id: individualBIsToARelation.id
          }
        })
        .then(response => {
          if (response.status === 200) {
            setError({
              individualAIsToBRelationError: "",
              individualBIsToARelationError: ""
            });
            setRedirect(true);
          }
        })
        .catch(error => {});
    } else {
      let relationError = {};

      relationError["individualAIsToBRelationError"] = !isEmpty(individualAIsToBRelation)
        ? ""
        : "Please select relation";
      relationError["individualBIsToARelationError"] = !isEmpty(individualBIsToARelation)
        ? ""
        : "Please select reverse relation";
      setError(relationError);
    }
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Create Relationship Type"} />
        <DocumentationContainer filename={"RelationshipType.md"}>
          {!isIndividualSubjectTypeAvailable && (
            <div style={{ color: "red", size: "10" }}>
              Please create an Individual subject type to enable this screen{" "}
            </div>
          )}

          {error.individualAIsToBRelationError !== "" && (
            <div style={{ color: "red", size: "6" }}>{error.individualAIsToBRelationError}</div>
          )}
          <FormControl>
            <InputLabel id="individualAIsToBRelation">Select Relationship*</InputLabel>
            <Select
              label="Select Relationship"
              value={_.isEmpty(individualAIsToBRelation) ? "" : individualAIsToBRelation}
              onChange={event => setIndividualAIsToBRelation(event.target.value)}
              style={{ width: "300px" }}
              required
            >
              {relations.map(relation => {
                return (
                  <MenuItem value={relation} key={relation.uuid}>
                    {relation.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <br />
          <br />
          {error.individualBIsToARelationError !== "" && (
            <div style={{ color: "red", size: "6" }}>{error.individualBIsToARelationError}</div>
          )}
          <FormControl>
            <InputLabel id="individualBIsToARelation">Select Reverse Relationship*</InputLabel>
            <Select
              label="Select Reverse Relationship"
              value={_.isEmpty(individualBIsToARelation) ? "" : individualBIsToARelation}
              onChange={event => setIndividualBIsToARelation(event.target.value)}
              style={{ width: "300px" }}
              required
            >
              {relations.map(relation => {
                return (
                  <MenuItem value={relation} key={relation.uuid}>
                    {relation.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <br />
          <SaveComponent
            name="save"
            onSubmit={() => onSubmitRelationshipType()}
            disabledFlag={!isIndividualSubjectTypeAvailable}
            styleClass={{ marginTop: "10px" }}
          />
          {redirect && <Redirect to={"/appDesigner/relationshipType/"} />}
        </DocumentationContainer>
      </Box>
    </>
  );
}

export default RelationshipTypeCreate;
