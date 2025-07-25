import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import { httpClient as http } from "common/utils/httpClient";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import { Grid } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import { useSelector } from "react-redux";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";

const RelationshipShow = () => {
  const [relationshipGenders, setRelationshipGenders] = useState([]);
  const [relationship, setRelationship] = useState({});
  const [genders, setGenders] = useState([]);

  const userInfo = useSelector(state => state.app.userInfo);

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    http.get("/web/relation/" + params.id).then(response => {
      setRelationship(response.data);
      const gender = response.data.genders.map(l => l.name);
      setRelationshipGenders(gender);
    });

    http.get("/web/gender").then(response => {
      setGenders(response.data.content);
    });
  }, [params.id]);

  const handleEdit = () => {
    navigate("/appDesigner/relationship/" + params.id);
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
        <Title title={"Show Relationship : " + relationship.name} />
        <DocumentationContainer filename={"Relationship.md"}>
          {UserInfo.hasPrivilege(
            userInfo,
            Privilege.PrivilegeType.EditSubjectType
          ) && (
            <Grid
              container
              style={{ justifyContent: "flex-end" }}
              size={{
                sm: 12
              }}
            >
              <Button color="primary" type="button" onClick={handleEdit}>
                <EditIcon />
                Edit
              </Button>
            </Grid>
          )}
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
                        checked={
                          relationshipGenders.includes(gender.name)
                            ? true
                            : false
                        }
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
        </DocumentationContainer>
      </Box>
    </>
  );
};

export default RelationshipShow;
