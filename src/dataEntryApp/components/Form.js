import React, { Fragment } from "react";
import { isNaN } from "lodash";
import { withParams } from "../../common/components/utils";
import { FormElementGroup } from "./FormElementGroup";
import Paginator from "./Paginator";
import { withRouter, Redirect } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import Typography from '@material-ui/core/Typography';
import { LineBreak } from "../../common/components/utils";
import moment from "moment/moment";

const useStyle = makeStyles(theme => ({
  form: {
    padding: theme.spacing(3, 3)
  }
}));


const Header = ({ subject }) => {
  const fullName = subject.firstName + " " + subject.lastName || "-";
  const gender = subject.gender.name || "-";
  const lowestAddressLevel = subject.lowestAddressLevel.title || "-";
  const dateOfBirth = moment().diff(subject.dateOfBirth, "years") + "yrs" || "-";
  return ( 
    <Fragment>
      <Typography>
        Name: {fullName} | Age: {dateOfBirth} | Gender: {gender} | Village: {lowestAddressLevel}
      </Typography>
      <LineBreak num={1} />
    </Fragment>
  )
};

const Form = ({ form, obs, updateObs, location, title, match, saved, onSaveGoto, onSave, subject }) => {    
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
        <FormElementGroup key={current.uuid} obs={obs} updateObs={updateObs}>
          {current}
        </FormElementGroup>
        {saved && <Redirect to={onSaveGoto} />}
        <Paginator pageDetails={pageDetails} onSave={onSave} />
      </Paper>
    </Fragment>
  );
};

export default withRouter(withParams(Form));
