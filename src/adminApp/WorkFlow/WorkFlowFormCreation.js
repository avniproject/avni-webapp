import React, { useState, useEffect } from "react";
import http from "common/utils/httpClient";
import { Redirect } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import { default as UUID } from "uuid";

function WorkFlowFormCreation(props) {
  const form = props.formMapping.filter(
    l => l.formType === "IndividualProfile" && l.subjectTypeUUID === props.rowDetails.uuid
  );
  const [formData, setFormData] = useState({});
  const [clicked, setClicked] = useState(form[0] ? true : false);
  const [error, setError] = useState("");
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    form.length !== 0 &&
      http
        .get("/forms/export?formUUID=" + form[0].formUUID)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {});
  }, []);

  const onCreateForm = () => {
    http
      .post("/web/forms", {
        name: "",
        formType: "IndividualProfile",
        formMappings: [
          {
            uuid: UUID.v4(),
            subjectTypeUuid: props.rowDetails.uuid
          }
        ]
      })
      .then(response => {
        setFormData(response.data);
        setClicked(true);
        setRedirect(true);
        setError("");
      })
      .catch(error => {
        setError(error);
        setRedirect(false);
      });
  };

  return (
    <>
      {" "}
      {clicked && (
        <Link href={"http://localhost:6010/#/appdesigner/forms/" + formData.uuid}>
          {formData.name}
        </Link>
      )}
      {!clicked && (
        <>
          <Button color="primary" onClick={() => onCreateForm()}>
            {" "}
            Add new form{" "}
          </Button>
        </>
      )}
      {redirect && <Redirect to={"/appdesigner/forms/" + formData.uuid} />}
    </>
  );
}

export default React.memo(WorkFlowFormCreation);
