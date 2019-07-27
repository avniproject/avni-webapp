import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { TextField } from "@material-ui/core";
import { getRegistrationForm } from "../../reducers/subjectReducer";
import ScreenWithAppBar from "../../components/ScreenWithAppBar";

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
    </ScreenWithAppBar>
  );
};

const mapStateToProps = state => ({
  user: state.app.user,
  subjectType: state.dataEntry.subject.registrationSubjectType,
  registrationForm: state.dataEntry.subject.registrationForm
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
