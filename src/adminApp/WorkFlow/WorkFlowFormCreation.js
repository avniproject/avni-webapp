import React, { useState } from "react";
import http from "common/utils/httpClient";
import { Redirect } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { default as UUID } from "uuid";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import { isEqual } from "lodash";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";
import Chip from "@material-ui/core/Chip";
import { cloneDeep } from "lodash";

function WorkFlowFormCreation(props) {
  let data,
    showAvailableForms = [],
    existMapping = [],
    form = props.formMapping.filter(
      formMapping =>
        formMapping.formType === props.formType &&
        formMapping[props.customUUID] === props.rowDetails.uuid &&
        formMapping.isVoided === false
    );

  const [error, setError] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [clicked, setClicked] = useState(form.length === 0 ? false : true);
  const [uuid, setUUID] = useState("");
  const [redirectToForm, setRedirectToForm] = useState(false);

  existMapping = props.formMapping.filter(l => l[props.customUUID] === props.rowDetails.uuid);

  showAvailableForms =
    form.length === 0
      ? props.formList.filter(
          form => form.formType === props.formType && form.formName !== undefined
        )
      : [];

  showAvailableForms.unshift({ formName: "createform", formUUID: "11111" });

  const formCreation = data => {
    http
      .post("/web/forms", data)
      .then(response => {
        setUUID(response.data.uuid);
        setRedirect(true);
        setError("");
      })
      .catch(error => {
        setError(error);
        setRedirect(false);
      });
  };

  const onRemoveFormAssociation = () => {
    let voidedFormAssociation = form[0];
    voidedFormAssociation["isVoided"] = true;
    const formMappingLengthForEntity = props.formMapping.filter(
      l => l[props.customUUID] === props.rowDetails.uuid
    );
    if (formMappingLengthForEntity.length === 1) {
      voidedFormAssociation["formUUID"] = null;
    } else {
      voidedFormAssociation["isVoided"] = true;
    }
    const formMappingClone = cloneDeep(props.formMapping);
    formMappingClone.forEach(formMap => {
      if (formMap.uuid === voidedFormAssociation.uuid) {
        formMap.isVoided = true;
      }
    });

    http
      .post("/emptyFormMapping", [voidedFormAssociation])
      .then(response => {
        props.setMapping(formMappingClone);
      })
      .catch(error => {
        console.log(error.response.data.message);
      });
  };

  const onCreateForm = () => {
    if (props.formType === "IndividualProfile") {
      data = {
        name: "",
        formType: props.formType,
        formMappings: [
          {
            uuid: UUID.v4(),
            subjectTypeUuid: props.rowDetails.uuid
          }
        ]
      };
      formCreation(data);
    } else if (props.formType === "ProgramEnrolment" || props.formType === "ProgramExit") {
      if (existMapping.length !== 0) {
        data = {
          name: "",
          formType: props.formType,
          formMappings: [
            {
              uuid: UUID.v4(),
              programUuid: props.rowDetails.uuid,
              subjectTypeUuid: ""
            }
          ]
        };
        data.formMappings[0].subjectTypeUuid = existMapping[0].subjectTypeUUID;
        formCreation(data);
      } else {
        setError("First select subject type for program");
      }
    }
  };

  const handleFormName = event => {
    if (event.target.value.formName === "createform") {
      onCreateForm();
    } else if (props.formType === "IndividualProfile") {
      data = {
        uuid: UUID.v4(),
        subjectTypeUUID: props.rowDetails.uuid,
        isVoided: false,
        formName: event.target.value.formName,
        formType: props.formType,
        formUUID: event.target.value.formUUID
      };

      http
        .post("/emptyFormMapping", [data])
        .then(response => {
          props.setMapping([...props.formMapping, data]);
          props.setNotificationAlert(true);
          props.setMessage("Form attached successfully...!!!");
        })
        .catch(error => {
          props.setNotificationAlert(true);
          props.setMessage("Failed in attaching form...!!!");
          console.log(error.response.data.message);
        });
    } else if (props.formType === "ProgramEnrolment" || props.formType === "ProgramExit") {
      if (existMapping.length !== 0) {
        data = {
          uuid: UUID.v4(),
          subjectTypeUUID: existMapping[0].subjectTypeUUID,
          programUUID: props.rowDetails.uuid,
          isVoided: false,
          formName: event.target.value.formName,
          formType: props.formType,
          formUUID: event.target.value.formUUID
        };
        http
          .post("/emptyFormMapping", [data])
          .then(response => {
            props.setMapping([...props.formMapping, data]);
            props.setNotificationAlert(true);
            props.setMessage("Form attached successfully...!!!");
          })
          .catch(error => {
            props.setNotificationAlert(true);
            props.setMessage("Failed in attaching form...!!!");
            console.log(error.response.data.message);
          });
      } else {
        setError("First select subject type for the program");
      }
    }
  };
  return (
    <>
      {error !== "" && (
        <span style={{ color: "red" }}>
          {error} <p />
        </span>
      )}
      {clicked && (
        <Chip
          size="medium"
          clickable
          color="primary"
          onClick={() => setRedirectToForm(true)}
          label={
            form[0].formName === undefined || form[0].formName === null
              ? props.fillFormName
              : form[0].formName
          }
          onDelete={() => onRemoveFormAssociation()}
        />
      )}
      {!clicked && (
        <>
          <FormControl>
            <InputLabel id="demo-simple-select-label">{props.placeholder}</InputLabel>
            <Select
              label="SelectForm"
              onChange={event => handleFormName(event)}
              style={{ width: "200px" }}
            >
              {showAvailableForms.map((form, index) => {
                return (
                  <MenuItem value={form} key={index}>
                    {form.formName === "createform" && (
                      <Button color="primary">Add new form</Button>
                    )}
                    {form.formName !== "createform" && form.formName}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </>
      )}
      {redirect && (
        <Redirect
          to={{
            pathname: "/appdesigner/forms/" + uuid,
            state: { stateName: props.redirectToWorkflow }
          }}
        />
      )}
      {redirectToForm && (
        <Redirect
          to={{
            pathname: `/appdesigner/forms/${form[0].formUUID}`
          }}
        />
      )}
      {props.notificationAlert && (
        <CustomizedSnackbar
          message={props.message}
          getDefaultSnackbarStatus={notificationAlert =>
            props.setNotificationAlert(notificationAlert)
          }
          defaultSnackbarStatus={props.notificationAlert}
        />
      )}
    </>
  );
}
function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

WorkFlowFormCreation.defaultProps = { isProgramEncounter: false };

export default React.memo(WorkFlowFormCreation, areEqual);
