import React from "react";
import { Route, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Box, TextField } from "@material-ui/core";
import { ObservationsHolder } from "avni-models";
import {
  getRegistrationForm,
  onLoad,
  saveSubject,
  updateObs,
  updateSubject
} from "../../reducers/registrationReducer";
import { getGenders } from "../../reducers/metadataReducer";
import ScreenWithAppBar from "../../../common/components/ScreenWithAppBar";
import { get, sortBy } from "lodash";
import { LineBreak, RelativeLink, withParams } from "../../../common/components/utils";
import Form from "../../components/Form";
import { DateOfBirth } from "../../components/DateOfBirth";
import { CodedFormElement } from "../../components/CodedFormElement";
import PrimaryButton from "../../components/PrimaryButton";
import LocationAutosuggest from "dataEntryApp/components/LocationAutosuggest";

const DefaultPage = props => {
  React.useEffect(() => {
    props.onLoad(props.match.queryParams.type);
  }, []);

  return (
    <ScreenWithAppBar appbarTitle={`${get(props, "subject.subjectType.name")} Registration`}>
      {props.subject && (
        <div>
          <h3>Register and enroll - Mother Program</h3>
          <Box display="flex" flexDirection="column">
            <TextField
              style={{ width: "30%" }}
              label="Date of Registration"
              type="date"
              required
              name="registrationDate"
              value={props.subject.registrationDate.toISOString().substr(0, 10)}
              onChange={e => {
                props.updateSubject("registrationDate", new Date(e.target.value));
              }}
            />
            <LineBreak num={1} />
            {get(props, "subject.subjectType.name") === "Individual" && (
              <React.Fragment>
                <TextField
                  style={{ width: "30%" }}
                  label="First Name"
                  type="text"
                  required
                  name="firstName"
                  value={props.subject.firstName}
                  onChange={e => {
                    props.updateSubject("firstName", e.target.value);
                  }}
                />
                <LineBreak num={1} />
                <TextField
                  style={{ width: "30%" }}
                  label="Last Name"
                  type="text"
                  required
                  name="lastName"
                  value={props.subject.lastName}
                  onChange={e => {
                    props.updateSubject("lastName", e.target.value);
                  }}
                />
                <LineBreak num={1} />
                <DateOfBirth
                  dateOfBirth={props.subject.dateOfBirth}
                  dateOfBirthVerified={props.subject.dateOfBirthVerified}
                  onChange={date => props.updateSubject("dateOfBirth", date)}
                  markVerified={verified => props.updateSubject("dateOfBirthVerified", verified)}
                />
                <LineBreak num={1} />
                <CodedFormElement
                  groupName="Gender"
                  items={sortBy(props.genders, "name")}
                  isChecked={item => item && get(props, "subject.gender.uuid") === item.uuid}
                  onChange={selected => props.updateSubject("gender", selected)}
                />
                <LocationAutosuggest
                  onSelect={location => props.updateSubject("lowestAddressLevel", location)}
                />
              </React.Fragment>
            )}

            {get(props, "subject.subjectType.name") !== "Individual" && (
              <React.Fragment>
                <TextField
                  label="Name"
                  type="text"
                  required
                  name="firstName"
                  value={props.subject.firstName}
                  onChange={e => {
                    props.updateSubject("firstName", e.target.value);
                  }}
                />
              </React.Fragment>
            )}
            <LineBreak num={4} />
            <Box display="flex" flexDirection={"row"} flexWrap="wrap" justifyContent="flex-end">
              <Box>
                <RelativeLink
                  to="form"
                  params={{
                    type: props.subject.subjectType.name,
                    from: props.location.pathname + props.location.search
                  }}
                  noUnderline
                >
                  <PrimaryButton>Next</PrimaryButton>
                </RelativeLink>
              </Box>
            </Box>
          </Box>
        </div>
      )}
    </ScreenWithAppBar>
  );
};

const mapStateToProps = state => ({
  user: state.app.user,
  genders: state.dataEntry.metadata.genders,
  form: state.dataEntry.registration.registrationForm,
  subject: state.dataEntry.registration.subject,
  loaded: state.dataEntry.registration.loaded
});

const mapDispatchToProps = {
  getRegistrationForm,
  updateSubject,
  getGenders,
  saveSubject,
  onLoad
};

const ConnectedDefaultPage = withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(DefaultPage)
  )
);

const mapFormStateToProps = state => ({
  form: state.dataEntry.registration.registrationForm,
  obs: new ObservationsHolder(state.dataEntry.registration.subject.observations),
  title: `${state.dataEntry.registration.subject.subjectType.name} Registration`,
  saved: state.dataEntry.registration.saved,
  onSaveGoto: "/app/search"
});

const mapFormDispatchToProps = {
  updateObs,
  onSave: saveSubject
};

const RegistrationForm = withRouter(
  connect(
    mapFormStateToProps,
    mapFormDispatchToProps
  )(Form)
);

const SubjectRegister = ({ match: { path } }) => {
  return (
    <div>
      <Route exact path={`${path}`} component={ConnectedDefaultPage} />
      <Route path={`${path}/form`} component={RegistrationForm} />
    </div>
  );
};

export default withRouter(SubjectRegister);
