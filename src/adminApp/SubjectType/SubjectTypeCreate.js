import TextField from "@material-ui/core/TextField";
import { Redirect } from "react-router-dom";
import React, { useState } from "react";
import http from "common/utils/httpClient";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";

const SubjectTypeCreate = props => {
  const [subjectTypeName, setSubjectTypeName] = useState("");
  const [nameValidation, setNameValidation] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState(false);
  const [id, setId] = useState();

  const onSubmit = event => {
    event.preventDefault();

    if (subjectTypeName === "") {
      setError("");
      setNameValidation(true);
    } else {
      setNameValidation(false);
      http
        .post("/web/subjectType", { name: subjectTypeName })
        .then(response => {
          if (response.status === 200) {
            setError("");
            setAlert(true);
            setId(response.data.id);
          }
        })
        .catch(error => {
          setError(error.response.data.message);
        });
    }
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Create subject type "} />

        <div className="container" style={{ float: "left" }}>
          <form onSubmit={onSubmit}>
            <TextField
              id="name"
              label="Name"
              autoComplete="off"
              value={subjectTypeName}
              onChange={event => setSubjectTypeName(event.target.value)}
            />
            <div />
            {nameValidation && (
              <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
                Empty name is not allowed.
              </FormLabel>
            )}
            {error !== "" && (
              <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
                {error}
              </FormLabel>
            )}
            <p />
            <Button color="primary" variant="contained" type="submit">
              <i className="material-icons">save</i>Save
            </Button>
          </form>
        </div>
      </Box>
      {alert && <Redirect to={"/appDesigner/subjectType/" + id + "/show"} />}
    </>
  );
};

export default SubjectTypeCreate;
