import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { TextField } from "@material-ui/core";
import { getRegistrationForm } from "../../reducers/subjectReducer";
import ScreenWithAppBar from "../../components/ScreenWithAppBar";
import { first } from "lodash";

const SubjectRegister = props => {
  React.useEffect(() => {
    props.getRegistrationForm();
  }, []);

  return (
    <ScreenWithAppBar appbarTitle={`${props.subjectType.name} Registration`}>
      <TextField
        label="Date of Registration"
        type="date"
        required
        name="registrationDate"
        defaultValue={new Date()}
        InputLabelProps={{
          shrink: true
        }}
      />
      <p> {JSON.stringify(props.form, null, 2)} </p>
    </ScreenWithAppBar>
  );
};

const mapStateToProps = state => ({
  user: state.app.user,
  subjectType:
    state.dataEntry.subject.registrationSubjectType ||
    first(state.dataEntry.metadata.operationalModules.subjectTypes),
  form: state.dataEntry.subject.registrationForm
});

const mapDispatchToProps = {
  getRegistrationForm
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SubjectRegister)
);
