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

function RelationshipTypeCreate() {
  const [individualAIsToBRelation, setIndividualAIsToBRelation] = useState({});
  const [individualBIsToARelation, setIndividualBIsToARelation] = useState({});
  const [relations, setRelations] = useState([]);

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
        setRelations(response.data);
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
          }
        })
        .catch(error => {
          // setError("existName");
        });
    } else {
      console.log(individualAIsToBRelation);
      console.log(individualBIsToARelation);
    }
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Create relationship type"} />
        {!isIndividualSubjectTypeAvailable && (
          <div style={{ color: "red", size: "10" }}>
            Please create an Individual subject type to enable this screen{" "}
          </div>
        )}

        <FormControl>
          <InputLabel id="individualAIsToBRelation">
            Select individual A is to B relation*
          </InputLabel>
          <Select
            label="Select individual A is to B relation"
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
        <FormControl>
          <InputLabel id="individualBIsToARelation">
            Select individual B is to A relation*
          </InputLabel>
          <Select
            label="Select individual B is to A relation"
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
      </Box>
    </>
  );
}

export default RelationshipTypeCreate;
