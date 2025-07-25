import { useEffect, useState } from "react";
import { httpClient as http } from "common/utils/httpClient";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import _, { get, isEmpty } from "lodash";
import { SaveComponent } from "../../../common/components/SaveComponent";
import { Navigate } from "react-router-dom";
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

  const [
    isIndividualSubjectTypeAvailable,
    setIsIndividualSubjectTypeAvailable
  ] = useState(true);

  useEffect(() => {
    let flag = false;
    http.get("/web/subjectType").then(response => {
      const subjectTypes = get(response, "data._embedded.subjectType");
      subjectTypes &&
        subjectTypes.forEach(subjectType => {
          if (subjectType.type === "Person") {
            flag = true;
          }
        });
      setIsIndividualSubjectTypeAvailable(flag);
    });

    http.get("/web/relation").then(response => {
      const filterVoidedRelations = response.data.filter(
        relation => !relation.voided
      );
      setRelations(filterVoidedRelations);
    });
  }, []);

  const onSubmitRelationshipType = () => {
    if (
      !isEmpty(individualAIsToBRelation) &&
      !isEmpty(individualBIsToARelation)
    ) {
      return http
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
        });
    } else {
      let relationError = {};

      relationError["individualAIsToBRelationError"] = !isEmpty(
        individualAIsToBRelation
      )
        ? ""
        : "Please select relation";
      relationError["individualBIsToARelationError"] = !isEmpty(
        individualBIsToARelation
      )
        ? ""
        : "Please select reverse relation";
      setError(relationError);
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
        <Title title={"Create Relationship Type"} />
        <DocumentationContainer filename={"RelationshipType.md"}>
          {!isIndividualSubjectTypeAvailable && (
            <div style={{ color: "red", size: "10" }}>
              Please create an Person subject type to enable this screen{" "}
            </div>
          )}
          {error.individualAIsToBRelationError !== "" && (
            <div style={{ color: "red", size: "6" }}>
              {error.individualAIsToBRelationError}
            </div>
          )}
          <FormControl>
            <InputLabel id="individualAIsToBRelation">
              Select Relationship*
            </InputLabel>
            <Select
              label="Select Relationship"
              value={
                _.isEmpty(individualAIsToBRelation)
                  ? ""
                  : individualAIsToBRelation
              }
              onChange={event =>
                setIndividualAIsToBRelation(event.target.value)
              }
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
            <div style={{ color: "red", size: "6" }}>
              {error.individualBIsToARelationError}
            </div>
          )}
          <FormControl>
            <InputLabel id="individualBIsToARelation">
              Select Reverse Relationship*
            </InputLabel>
            <Select
              label="Select Reverse Relationship"
              value={
                _.isEmpty(individualBIsToARelation)
                  ? ""
                  : individualBIsToARelation
              }
              onChange={event =>
                setIndividualBIsToARelation(event.target.value)
              }
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
          {redirect && <Navigate to={"/appDesigner/relationshipType/"} />}
        </DocumentationContainer>
      </Box>
    </>
  );
}
export default RelationshipTypeCreate;
