import React, { Fragment } from "react";
import { isNaN } from "lodash";
import { withParams } from "../../../common/components/utils";
import Paginator from "../../components/Paginator";
import { withRouter, Redirect } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import Typography from '@material-ui/core/Typography';
import { LineBreak } from "../../../common/components/utils";
import moment from "moment/moment";
import Form from "../../components/Form";
import Summary from './Summary';

const useStyle = makeStyles(theme => ({
  form: {
    padding: theme.spacing(3, 3)
  },
  details: {
    marginBottom: 10,
    color: "rgba(0, 0, 0, 0.54)"
  }
}));


const Header = ({ subject }) => {
  const classes = useStyle();
  const fullName = subject.firstName + " " + subject.lastName || "-";
  const gender = subject.gender.name || "-";
  const lowestAddressLevel = subject.lowestAddressLevel.title || "-";
  const dateOfBirth = moment().diff(subject.dateOfBirth, "years") + "yrs" || "-";
  return (
    <Fragment>
      <div className={classes.details}>
        <Typography variant="caption" gutterBottom>
          Name: {fullName} | Age: {dateOfBirth} | Gender: {gender} | Village: {lowestAddressLevel}
        </Typography>
      </div>

    </Fragment>
  )
};

const SubjectRegistrationForm = ({ form, obs, updateObs, location, title, match, saved, onSaveGoto, onSave, subject }) => {
  const classes = useStyle();

  const page = +match.queryParams.page;
  const from = match.queryParams.from;

  const firstPageNumber = form.firstFormElementGroup.displayOrder;
  const currentPageNumber = isNaN(page) ? firstPageNumber : page;
  const lastPageNumber = form.getLastFormElementElementGroup().displayOrder;

  const pageDetails = {
    nextPageNumber:
      currentPageNumber === lastPageNumber
        ? null
        : form.getNextFormElement(currentPageNumber).displayOrder,
    previousPageNumber:
      currentPageNumber === firstPageNumber
        ? null
        : form.getPrevFormElement(currentPageNumber).displayOrder,
    location,
    from
  };

  const current = form.formElementGroupAt(currentPageNumber);

  return (
    <Fragment>
      <Header subject={subject}></Header>
      <h6>
        {currentPageNumber + 1}. {current.name}
      </h6>
      <Paper className={classes.form}>
        {(currentPageNumber === lastPageNumber) ? <Summary subject={subject} /> :
          <Form current={current} obs={obs} updateObs={updateObs}></Form>}

        {saved && <Redirect to={onSaveGoto} />}
        <Paginator pageDetails={pageDetails} onSave={onSave} />
      </Paper>
    </Fragment>
  );
}

export default withRouter(withParams(SubjectRegistrationForm));
