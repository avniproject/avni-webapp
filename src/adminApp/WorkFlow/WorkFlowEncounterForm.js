import React, { useState } from "react";
import http from "common/utils/httpClient";
import { Redirect } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import { default as UUID } from "uuid";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import { isEqual } from "lodash";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";

function WorkFlowEncounterForm(props) {
  let data,
    showAvailableForms = [],
    removeDuplicate = [],
    existMapping = [],
    formType;

  const encounters = props.formMapping.filter(l => l.encounterTypeUUID === props.rowDetails.uuid);
  if (props.whichForm === "encounter" && encounters[0] !== undefined && encounters[0] !== null) {
    formType = Object.keys(encounters[0]).includes("programUUID")
      ? "ProgramEncounter"
      : "Encounter";
  } else if (
    props.whichForm === "cancellation" &&
    encounters[0] !== undefined &&
    encounters[0] !== null
  ) {
    formType = Object.keys(encounters[0]).includes("programUUID")
      ? "ProgramEncounterCancellation"
      : "IndividualEncounterCancellation";
  }

  let form = props.formMapping.filter(
    l => l.formType === formType && l.encounterTypeUUID === props.rowDetails.uuid
  );

  const [error, setError] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [clicked, setClicked] = useState(form.length === 0 ? false : true);
  const [uuid, setUUID] = useState("");

  existMapping = props.formMapping.filter(l => l.encounterTypeUUID === props.rowDetails.uuid);

  form.length === 0 &&
    props.formMapping.map(l => {
      if (
        l.formType === formType &&
        l.formName !== undefined &&
        l.formName !== null &&
        !removeDuplicate.includes(l.formName)
      ) {
        removeDuplicate.push(l.formName);
        showAvailableForms.push(l);
      }
    });

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

  const onCreateForm = () => {
    if (formType === "Encounter" || formType === "IndividualEncounterCancellation") {
      data = {
        name: "",
        formType: formType,
        formMappings: [
          {
            uuid: UUID.v4(),
            subjectTypeUuid: "",
            encounterTypeUuid: props.rowDetails.uuid
          }
        ]
      };
      data.formMappings[0].subjectTypeUuid = existMapping[0].subjectTypeUUID;
      formCreation(data);
    } else if (formType === "ProgramEncounter" || formType === "ProgramEncounterCancellation") {
      if (existMapping.length !== 0) {
        data = {
          name: "",
          formType: formType,
          formMappings: [
            {
              uuid: UUID.v4(),
              programUuid: "",
              subjectTypeUuid: "",
              encounterTypeUuid: props.rowDetails.uuid
            }
          ]
        };
        data.formMappings[0].subjectTypeUuid = existMapping[0].subjectTypeUUID;
        data.formMappings[0].programUuid = existMapping[0].programUUID;
        formCreation(data);
      } else {
        setError("First select subject type for program");
      }
    }
  };

  const handleFormName = event => {
    if (event.target.value.formName === "createform") {
      onCreateForm();
    } else if (formType === "Encounter" || formType === "IndividualEncounterCancellation") {
      data = {
        uuid: UUID.v4(),
        encounterTypeUUID: props.rowDetails.uuid,
        subjectTypeUUID: existMapping[0].subjectTypeUUID,
        isVoided: false,
        formName: event.target.value.formName,
        formType: formType,
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
    } else if (formType === "ProgramEncounter" || formType === "ProgramEncounterCancellation") {
      if (existMapping.length !== 0) {
        data = {
          uuid: UUID.v4(),
          subjectTypeUUID: existMapping[0].subjectTypeUUID,
          programUUID: existMapping[0].programUUID,
          encounterTypeUUID: props.rowDetails.uuid,
          isVoided: false,
          formName: event.target.value.formName,
          formType: formType,
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
        <Link href={"/#/appdesigner/forms/" + form[0].formUUID}>
          {form[0].formName === undefined || form[0].formName === null
            ? props.fillFormName
            : form[0].formName}
        </Link>
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
            state: { stateName: "encounterType" }
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
export default React.memo(WorkFlowEncounterForm, areEqual);
