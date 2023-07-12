import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { FormControl, Input, InputLabel, Select } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import http from "common/utils/httpClient";
import { Redirect } from "react-router-dom";
import FormHelperText from "@material-ui/core/FormHelperText";
import CustomizedSnackbar from "./CustomizedSnackbar";
import { FormTypeEntities } from "../common/constants";
import { default as UUID } from "uuid";
import _ from "lodash";
import UserInfo from "../../common/model/UserInfo";
import { connect } from "react-redux";

class NewFormModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: props.name,
      formTypeInfo: null,
      data: {},
      toFormDetails: "",
      errors: { name: "", formTypeInfo: "" },
      showUpdateAlert: false,
      defaultSnackbarStatus: true
    };
  }

  validateForm() {
    let errorsList = {};
    if (this.state.name === "") errorsList["name"] = "Please enter form name.";
    if (_.isNil(this.state.formTypeInfo)) errorsList["formTypeInfo"] = "Please select form type.";
    this.setState({
      errors: errorsList
    });

    let errorFlag = true;
    if (Object.keys(errorsList).length > 0) errorFlag = false;
    return errorFlag;
  }

  getDefaultSnackbarStatus = defaultSnackbarStatus => {
    this.setState({ defaultSnackbarStatus: defaultSnackbarStatus });
  };

  onSubmitForm() {
    const validateFormStatus = this.validateForm();
    if (validateFormStatus) {
      let dataSend = {
        name: this.state.name,
        formType: this.state.formTypeInfo.formType
      };
      http
        .post("/web/forms", dataSend)
        .then(response => {
          if (!this.props.isCloneForm) {
            this.setState({
              toFormDetails: response.data.uuid
            });
          } else {
            const newUUID = response.data.uuid;
            let editResponse;
            http
              .get(`/forms/export?formUUID=${this.props.uuid}`)
              .then(response => {
                const oldParentToNewParentUUIDsMap = new Map();
                editResponse = response.data;
                editResponse["uuid"] = newUUID;
                editResponse["name"] = this.state.name;
                editResponse["formType"] = this.state.formTypeInfo.formType;

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
                    http
                      .post("/forms", editResponse)
                      .then(response => {
                        if (response.status === 200) {
                          this.setState({ toFormDetails: newUUID });
                        }
                      })
                      .catch(error => {
                        console.log(error);
                      });
                  },
                  function(error) {
                    console.log(error);
                  }
                );
              })
              .catch(error => {
                console.log(error);
              });
          }
        })
        .catch(error => {
          this.setState({ errorMsg: error.response.data });
        });
    }
  }

  componentDidMount() {
    http
      .get("/web/operationalModules")
      .then(response => {
        let data = Object.assign({}, response.data);
        delete data["formMappings"];
        this.setState({
          data: data
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  onChangeField(event) {
    this.setState(Object.assign({}, this.state, { [event.target.name]: event.target.value }));
  }

  formTypes() {
    return _.map(
      _.filter(FormTypeEntities.getAllFormTypeInfo(), x =>
        UserInfo.hasFormEditPrivilege(this.props.userInfo, x.formType)
      ),
      formTypeInfo => {
        return (
          <MenuItem key={formTypeInfo} value={formTypeInfo}>
            {formTypeInfo.display}
          </MenuItem>
        );
      }
    );
  }
  render() {
    if (this.state.toFormDetails !== "") {
      return <Redirect to={"/appdesigner/forms/" + this.state.toFormDetails} />;
    }

    return (
      <div>
        <form>
          {this.state.errorMsg && (
            <FormControl fullWidth margin="dense">
              <li style={{ color: "red" }}>{this.state.errorMsg}</li>
            </FormControl>
          )}

          <FormControl fullWidth margin="dense">
            <InputLabel htmlFor="formType">Form Type</InputLabel>
            <Select
              id="formTypeInfo"
              name="formTypeInfo"
              value={this.state.formTypeInfo}
              onChange={this.onChangeField.bind(this)}
              required
            >
              {this.formTypes()}
            </Select>
            {this.state.errors.formTypeInfo && (
              <FormHelperText error>{this.state.errors.formTypeInfo}</FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel htmlFor="name">Name</InputLabel>
            <Input
              type="text"
              id="formName"
              name="name"
              value={this.state.name}
              onChange={this.onChangeField.bind(this)}
              autoComplete="off"
              fullWidth
            />
            {this.state.errors.name && (
              <FormHelperText error>{this.state.errors.name}</FormHelperText>
            )}
          </FormControl>
        </form>
        <Button
          variant="contained"
          color="primary"
          onClick={this.onSubmitForm.bind(this)}
          style={{ marginTop: 10 }}
        >
          Add
        </Button>
        {this.state.showUpdateAlert && (
          <CustomizedSnackbar
            message="Form settings updated successfully!"
            getDefaultSnackbarStatus={this.getDefaultSnackbarStatus}
            defaultSnackbarStatus={this.state.defaultSnackbarStatus}
          />
        )}
      </div>
    );
  }
}

NewFormModal.defaultProps = {
  name: "",
  uuid: "",
  isCloneForm: false
};

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default connect(mapStateToProps)(NewFormModal);
