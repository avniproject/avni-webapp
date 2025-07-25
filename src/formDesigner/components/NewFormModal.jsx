import { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  Input,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from "@mui/material";
import { httpClient as http } from "common/utils/httpClient";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CustomizedSnackbar from "./CustomizedSnackbar";
import { FormTypeEntities } from "../common/constants";
import { default as UUID } from "uuid";
import _ from "lodash";
import UserInfo from "../../common/model/UserInfo";

const NewFormModal = ({ name = "", uuid = "", isCloneForm = false }) => {
  const userInfo = useSelector(state => state.app.userInfo);

  const [formData, setFormData] = useState({
    name: name,
    formTypeInfo: null
  });

  const [data, setData] = useState({});
  const [toFormDetails, setToFormDetails] = useState("");
  const [errors, setErrors] = useState({ name: "", formTypeInfo: "" });
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
  const [defaultSnackbarStatus, setDefaultSnackbarStatus] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const validateForm = () => {
    let errorsList = {};
    if (formData.name === "") errorsList["name"] = "Please enter form name.";
    if (_.isNil(formData.formTypeInfo))
      errorsList["formTypeInfo"] = "Please select form type.";

    setErrors(errorsList);

    return Object.keys(errorsList).length === 0;
  };

  const getDefaultSnackbarStatus = status => {
    setDefaultSnackbarStatus(status);
  };

  const onSubmitForm = () => {
    const validateFormStatus = validateForm();
    if (validateFormStatus) {
      let dataSend = {
        name: formData.name,
        formType: formData.formTypeInfo.formType
      };

      http.post("/web/forms", dataSend).then(response => {
        if (!isCloneForm) {
          setToFormDetails(response.data.uuid);
        } else {
          const newUUID = response.data.uuid;
          let editResponse;

          http.get(`/forms/export?formUUID=${uuid}`).then(response => {
            const oldParentToNewParentUUIDsMap = new Map();
            editResponse = response.data;
            editResponse["uuid"] = newUUID;
            editResponse["name"] = formData.name;
            editResponse["formType"] = formData.formTypeInfo.formType;

            const promise = new Promise((resolve, reject) => {
              _.forEach(editResponse.formElementGroups, group => {
                group["uuid"] = UUID.v4();
                _.forEach(group.formElements, element => {
                  const newUuid = UUID.v4();
                  oldParentToNewParentUUIDsMap.set(element.uuid, newUuid);
                  element["uuid"] = newUuid;
                  if (element.parentFormElementUuid) {
                    element.parentFormElementUuid = oldParentToNewParentUUIDsMap.get(
                      element.parentFormElementUuid
                    );
                  }
                });
              });
              resolve("Promise resolved ");
            });

            promise.then(
              result => {
                http.post("/forms", editResponse).then(response => {
                  if (response.status === 200) {
                    setToFormDetails(newUUID);
                  }
                });
              },
              function(error) {
                console.log(error);
              }
            );
          });
        }
      });
    }
  };

  useEffect(() => {
    http.get("/web/operationalModules").then(response => {
      let responseData = Object.assign({}, response.data);
      delete responseData["formMappings"];
      setData(responseData);
    });
  }, []);

  const onChangeField = event => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formTypes = () => {
    return _.map(
      _.filter(FormTypeEntities.getAllFormTypeInfo(), x =>
        UserInfo.hasFormEditPrivilege(userInfo, x.formType)
      ),
      formTypeInfo => {
        return (
          <MenuItem key={formTypeInfo} value={formTypeInfo}>
            {formTypeInfo.display}
          </MenuItem>
        );
      }
    );
  };

  if (toFormDetails !== "") {
    return <Navigate to={"/appdesigner/forms/" + toFormDetails} />;
  }

  return (
    <div>
      <form>
        {errorMsg && (
          <FormControl fullWidth margin="dense">
            <li style={{ color: "red" }}>{errorMsg}</li>
          </FormControl>
        )}

        <FormControl fullWidth margin="dense">
          <InputLabel htmlFor="formType">Form Type</InputLabel>
          <Select
            id="formTypeInfo"
            name="formTypeInfo"
            value={formData.formTypeInfo}
            onChange={onChangeField}
            required
          >
            {formTypes()}
          </Select>
          {errors.formTypeInfo && (
            <FormHelperText error>{errors.formTypeInfo}</FormHelperText>
          )}
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel htmlFor="name">Name</InputLabel>
          <Input
            type="text"
            id="formName"
            name="name"
            value={formData.name}
            onChange={onChangeField}
            autoComplete="off"
            fullWidth
          />
          {errors.name && <FormHelperText error>{errors.name}</FormHelperText>}
        </FormControl>
      </form>

      <Button
        variant="contained"
        color="primary"
        onClick={onSubmitForm}
        style={{ marginTop: 10 }}
      >
        Add
      </Button>

      {showUpdateAlert && (
        <CustomizedSnackbar
          message="Form settings updated successfully!"
          getDefaultSnackbarStatus={getDefaultSnackbarStatus}
          defaultSnackbarStatus={defaultSnackbarStatus}
        />
      )}
    </div>
  );
};

export default NewFormModal;
