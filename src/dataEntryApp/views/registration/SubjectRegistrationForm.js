import React, { Fragment } from "react";
import _, { isNaN } from "lodash";
import { withParams } from "../../../common/components/utils";
import Paginator from "../../components/Paginator";
import { withRouter, Redirect } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import { LineBreak } from "../../../common/components/utils";
import moment from "moment/moment";
import Form from "../../components/Form";
import Summary from "./Summary";
import { Box, Typography, Paper } from "@material-ui/core";
import CustomizedDialog from "../../components/Dialog";
import { useTranslation } from "react-i18next";
import BrowserStore from "../../api/browserStore";
import { FormElementGroup, ValidationResults } from "avni-models";

const useStyle = makeStyles(theme => ({
  form: {
    padding: theme.spacing(0, 3, 10, 3),
    height: "Auto",
    border: "1px solid #f1ebeb",
    position: "relative",
    minHeight: "600px"
  },
  detailsstyle: {
    color: "#000",
    fontSize: "bold"
  },
  details: {
    color: "rgba(0, 0, 0, 0.54)",
    backgroundColor: "#f8f4f4",
    height: 40,
    width: "100%",
    padding: 8,
    marginBottom: 10
  },
  buttomstyle: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: "#f8f4f4",
    height: 80,
    width: "100%",
    padding: 25
  }
}));

const Header = ({ subject }) => {
  const classes = useStyle();
  const { t } = useTranslation();
  const fullName = subject.firstName + " " + subject.lastName || "-";
  const gender = subject.gender.name || "-";
  const lowestAddressLevel = subject.lowestAddressLevel.title || "-";
  const dateOfBirth = moment().diff(subject.dateOfBirth, "years") + "yrs" || "-";
  return (
    <div className={classes.details}>
      <Typography variant="caption" gutterBottom>
        {t("name")}:{" "}
        <Typography className={classes.detailsstyle} variant="caption" gutterBottom>
          {fullName}
        </Typography>{" "}
        | {t("age")}:{" "}
        <Typography className={classes.detailsstyle} variant="caption" gutterBottom>
          {dateOfBirth}
        </Typography>{" "}
        | {t("gender")}:{" "}
        <Typography className={classes.detailsstyle} variant="caption" gutterBottom>
          {gender}
        </Typography>{" "}
        | {t("Village")}:{" "}
        <Typography className={classes.detailsstyle} variant="caption" gutterBottom>
          {lowestAddressLevel}
        </Typography>
      </Typography>
      <LineBreak num={2} />
    </div>
  );
};

const SubjectRegistrationForm = ({
  form,
  obs,
  updateObs,
  location,
  title,
  match,
  saved,
  onSaveGoto,
  onSave,
  subject,
  onLoad,
  setSubject,
  validationResults,
  setValidationResults,
  moveNext
}) => {
  React.useEffect(() => {
    if (!subject) {
      (async function fetchData() {
        await onLoad(match.queryParams.type);
        let subject = BrowserStore.fetchSubject();
        if (subject) {
          setSubject(subject);
        }
      })();
    }
  });
  const classes = useStyle();
  const [redirect, setRedirect] = React.useState(false);
  // const [isMoveNext, setMoveNext] = React.useState();

  const from = match.queryParams.from;
  console.log(" Inside subject registration form :: printing fe and obs");
  console.log(current);
  console.log(obs);

  const firstPageNumber = form && form.firstFormElementGroup.displayOrder;
  const lastPageNumber = form && form.getLastFormElementElementGroup().displayOrder;
  const page =
    match.queryParams.page === parseInt(lastPageNumber)
      ? parseInt(match.queryParams.page)
      : +match.queryParams.page;

  const currentPageNumber = isNaN(page) ? firstPageNumber : page;
  console.log("Here to print ... moveNext ");
  console.log(moveNext);
  // console.log(firstPageNumber);
  // console.log(page);
  // console.log(form && form.getNextFormElement(currentPageNumber).displayOrder);
  // console.log(form && form.getNextFormElement(currentPageNumber -1).displayOrder);
  const showSummaryPage = page >= lastPageNumber + 1;

  const pageDetails = {
    nextPageNumber: showSummaryPage
      ? null
      : form && form.getNextFormElement(currentPageNumber) != undefined
      ? form.getNextFormElement(currentPageNumber).displayOrder
      : currentPageNumber + 1,
    previousPageNumber:
      currentPageNumber === firstPageNumber
        ? null
        : showSummaryPage
        ? form && form.getPrevFormElement(currentPageNumber - 1).displayOrder
        : form && form.getPrevFormElement(currentPageNumber).displayOrder,
    location,
    from
  };
  pageDetails.nextPageNumber = moveNext
    ? pageDetails.nextPageNumber
    : pageDetails.nextPageNumber - 1;
  // pageDetails.previousPageNumber = isMoveNext ? pageDetails.previousPageNumber : pageDetails.nextPageNumber -1;
  console.log(pageDetails);

  const current = showSummaryPage
    ? { name: "Summary" }
    : form && form.formElementGroupAt(currentPageNumber);
  const pageCount = currentPageNumber + " / " + (lastPageNumber + 1);
  const { t } = useTranslation();
  const onOkHandler = data => {
    BrowserStore.clear("subject");
    setRedirect(data);
  };
  const nextHandler = () => {
    //   console.log("ï ma at next button static");
    //    console.log("cureentttt",current);
    // console.log("validation results",validationResults);
    // console.log("observations",obs);
    const formElementGroup = new FormElementGroup();
    const formElementGroupValidations = formElementGroup.validate(obs, current.formElements);
    console.log(" Printing.. formElementGroupValidations.hasValidationError()");
    console.log(formElementGroupValidations);
    // setMoveNext(!(new ValidationResults(formElementGroupValidations).hasValidationError()));
    const allValidationResults = _.unionBy(
      validationResults,
      formElementGroupValidations,
      "formIdentifier"
    );
    setValidationResults(allValidationResults);
  };

  return (
    <Fragment>
      {form && (
        <div>
          <Header subject={subject} />
          <Box display="flex" flexDirection={"row"} flexWrap="wrap" justifyContent="space-between">
            <Typography variant="subtitle1" gutterBottom>
              {" "}
              {currentPageNumber}. {t(current.name)}{" "}
            </Typography>
            <button onClick={nextHandler}>next111</button>
            <Paginator
              pageDetails={pageDetails}
              onSave={onSave}
              label={{ Previous: "previous", Next: "next", Save: "save", type: "text" }}
              showCount={true}
              count={pageCount}
              feg={current}
              obs={obs}
            />
          </Box>
          <Paper className={classes.form}>
            {currentPageNumber >= lastPageNumber + 1 ? (
              <Summary subject={subject} />
            ) : (
              <Form
                current={current}
                obs={obs}
                updateObs={updateObs}
                validationResults={validationResults}
              />
            )}

            {saved && (
              <CustomizedDialog
                showSuccessIcon="true"
                message="Your details have been successfully registered."
                showOkbtn="true"
                openDialogContainer={true}
                onOk={onOkHandler}
              />
            )}
            {saved && redirect && <Redirect to={onSaveGoto} />}
            <div className={classes.buttomstyle}>
              <Paginator
                pageDetails={pageDetails}
                onSave={onSave}
                label={{ Previous: "previous", Next: "next", Save: "save" }}
                showCount={false}
                feg={current}
                obs={obs}
              />
            </div>
          </Paper>
        </div>
      )}
    </Fragment>
  );
};

export default withRouter(withParams(SubjectRegistrationForm));
