import { useEffect, useState } from "react";
import { httpClient as http } from "common/utils/httpClient";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { SaveComponent } from "../../../common/components/SaveComponent";
import { cloneDeep, get } from "lodash";
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

    http.get("/web/gender").then(response => {
      setGenders(response.data.content);
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
        .post("/web/relation", {
          name: relationshipName,
          genders: genderToBesubmit
        })
        .then(response => {
          if (response.status === 200) {
            setId(response.data.id);
          }
        });
    } else {
      setError("emptyName");
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
        <Title title={"Create Relationship"} />
        <DocumentationContainer filename={"Relationship.md"}>
          {!isIndividualSubjectTypeAvailable && (
            <div style={{ color: "red", size: "10" }}>Please create an Person subject type to enable this screen </div>
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
            <SaveComponent name="save" onSubmit={() => onSubmitRelationship()} disabledFlag={!isIndividualSubjectTypeAvailable} />
          </div>
          {id !== "" && <Redirect to={"/appDesigner/relationship/" + id + "/show"} />}
        </DocumentationContainer>
      </Box>
    </>
  );
}
export default RelationshipCreate;
