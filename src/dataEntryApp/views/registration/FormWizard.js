import React, { Fragment } from "react";
import { isNil, filter, isEmpty } from "lodash";
import { withParams } from "../../../common/components/utils";
import { withRouter, Redirect } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import { LineBreak } from "../../../common/components/utils";
import moment from "moment/moment";
import Form from "../../components/Form";
import Summary from "./Summary";
import { Box, Typography, Paper, Chip, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import BrowserStore from "../../api/browserStore";
import { FormElementGroup, ValidationResults } from "avni-models";
import { RelativeLink, InternalLink } from "common/components/utils";
import { useHistory, useLocation } from "react-router-dom";
import CustomizedSnackbar from "../../components/CustomizedSnackbar";

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
    backgroundColor: "#F8F9F9",
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
  },
  topprevnav: {
    color: "#cecdcd",
    fontSize: "13px",
    border: "none",
    background: "white"
  },
  toppagenum: {
    backgroundColor: "silver",
    color: "black",
    fontSize: 12,
    padding: 3
  },
  topnav: {
    color: "orange",
    fontSize: "13px",
    cursor: "pointer",
    border: "none",
    background: "white",

    "&:hover": {
      background: "none",
      border: "none"
    },

    "&:active": {
      border: "none",
      outlineColor: "white"
    }
  },
  prevbuttonspace: {
    color: "#cecdcd",
    marginRight: 27,
    width: 100
  },
  nextBtn: {
    color: "white",
    width: 110,
    cursor: "pointer",
    height: 30,
    padding: "4px 25px",
    fontSize: 12,
    borderRadius: 50,
    backgroundColor: "orange"
  },
  buttomboxstyle: {
    backgroundColor: "#f8f4f4",
    height: 80,
    width: "100%",
    padding: 25
  },
  privbuttonStyle: {
    color: "orange",
    width: 110,
    height: 30,
    fontSize: 12,
    borderColor: "orange",
    cursor: "pointer",
    borderRadius: 50,
    padding: "4px 25px",
    backgroundColor: "white"
  },
  nextbuttonStyle: {
    backgroundColor: "orange",
    color: "white",
    height: 30,
    fontSize: 12,
    width: 110,
    cursor: "pointer",
    borderRadius: 50,
    padding: "4px 25px"
  },
  noUnderline: {
    "&:hover, &:focus": {
      textDecoration: "none"
    }
  }
}));

const Header = ({ subject, children }) => {
  const classes = useStyle();
  const { t } = useTranslation();
  const fullName = subject.firstName + " " + subject.lastName || "-";
  const gender = subject.gender ? subject.gender.name || "-" : "";
  const lowestAddressLevel = subject.lowestAddressLevel
    ? subject.lowestAddressLevel.name || "-"
    : "";
  const lowestAddressLevelType = subject.lowestAddressLevel
    ? subject.lowestAddressLevel.type || "-"
    : "";
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
        | {t(lowestAddressLevelType)}:{" "}
        <Typography className={classes.detailsstyle} variant="caption" gutterBottom>
          {lowestAddressLevel}
        </Typography>
      </Typography>
      <LineBreak num={2} />
    </div>
  );
};

const WizardButton = ({ text, className, to, params, onClick, disabled }) => {
  const classes = useStyle();

  if (disabled) {
    return (
      <Button disabled={disabled} className={className} onClick={onClick} type="button">
        {text}
      </Button>
    );
  }
  if (to) {
    return (
      <InternalLink noUnderline to={to} params={{ page: "" }}>
        <Button className={className} onClick={onClick} type="button">
          {text}
        </Button>
      </InternalLink>
    );
  }
  return (
    <RelativeLink noUnderline params={params}>
      <Button className={className} onClick={onClick} type="button">
        {text}
      </Button>
    </RelativeLink>
  );
};

const FormWizard = ({
  form,
  obsHolder,
  updateObs,
  observations,
  match,
  saved,
  onSaveGoto,
  onSave,
  message,
  subject,
  validationResults,
  staticValidationResults,
  setValidationResults,
  registrationFlow,
  children
}) => {
  if (!form) return <div />;
  const [redirect, setRedirect] = React.useState(false);
  const classes = useStyle();
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  if (saved) {
    BrowserStore.clear("subject");
    setTimeout(() => {
      setRedirect(true);
    }, 2500);
  }

  const from = match.queryParams.from;
  const currentPageNumber = match.queryParams.page ? parseInt(match.queryParams.page) : 1;
  const formElementGroups = form
    .getFormElementGroups()
    .filter(feg => !isEmpty(feg.nonVoidedFormElements()));
  const formElementGroupsLength = formElementGroups.length;

  const isOnSummaryPage = currentPageNumber > formElementGroupsLength;

  let currentFormElementGroup;
  if (!isOnSummaryPage) {
    currentFormElementGroup = formElementGroups[currentPageNumber - 1];
  }

  const handleNext = (event, feg) => {
    //Filtered Form Elements where voided is false, can be removed once handled generically (API/UI)
    const filteredFormElement = filter(feg.formElements, fe => fe.voided === false);
    const formElementGroup = new FormElementGroup();
    const formElementGroupValidations = formElementGroup.validate(obsHolder, filteredFormElement);
    const staticValidationResultsError =
      staticValidationResults &&
      new ValidationResults(staticValidationResults).hasValidationError();

    setValidationResults(formElementGroupValidations);
    if (!isEmpty(formElementGroupValidations)) {
      if (
        new ValidationResults(formElementGroupValidations).hasValidationError() ||
        staticValidationResultsError
      ) {
        event.preventDefault();
      }
    }
  };

  const pageTitleNumber = registrationFlow ? currentPageNumber + 1 : currentPageNumber;
  const pageTitleText = isOnSummaryPage
    ? t("summaryAndRecommendations")
    : t(currentFormElementGroup.name);
  const pageTitle = `${pageTitleNumber}. ${pageTitleText}`;
  const totalNumberOfPages = formElementGroupsLength + (registrationFlow ? 2 : 1);
  const pageCounter = `${pageTitleNumber} / ${totalNumberOfPages}`;

  let prevParams;
  if (registrationFlow && currentPageNumber === 1) {
    prevParams = {};
  } else {
    prevParams = { page: currentPageNumber - 1 };
  }

  const goBackToRegistrationDefaultPage = registrationFlow && currentPageNumber === 1;

  return (
    <Fragment>
      {form && (
        <div>
          {subject ? <Header subject={subject} /> : ""}
          <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-between">
            <Typography variant="subtitle1" gutterBottom>
              {" "}
              {pageTitle}
            </Typography>
            <Box flexDirection={"row"} display={"flex"}>
              <WizardButton
                className={classes.topnav}
                to={goBackToRegistrationDefaultPage ? from : null}
                params={goBackToRegistrationDefaultPage ? {} : { page: currentPageNumber - 1 }}
                text={t("previous")}
                disabled={!registrationFlow && currentPageNumber === 1}
              />
              <label className={classes.toppagenum}>{pageCounter}</label>
              {!isOnSummaryPage ? (
                <WizardButton
                  className={classes.topnav}
                  onClick={e => handleNext(e, currentFormElementGroup)}
                  params={{ page: currentPageNumber + 1 }}
                  text={t("next")}
                />
              ) : (
                <Button className={classes.topnav} onClick={onSave} type="button">
                  {t("save")}
                </Button>
              )}
            </Box>
          </Box>
          <Paper className={classes.form}>
            {isOnSummaryPage ? (
              <Summary observations={observations} />
            ) : (
              <Form
                current={currentFormElementGroup}
                obsHolder={obsHolder}
                updateObs={updateObs}
                validationResults={validationResults}
                children={children}
              />
            )}

            <Box className={classes.buttomstyle} display="flex">
              <Box style={{ marginRight: 20 }}>
                <WizardButton
                  className={classes.privbuttonStyle}
                  to={goBackToRegistrationDefaultPage ? from : null}
                  params={goBackToRegistrationDefaultPage ? {} : { page: currentPageNumber - 1 }}
                  text={t("previous")}
                  disabled={!registrationFlow && currentPageNumber === 1}
                />
              </Box>
              <Box>
                {!isOnSummaryPage ? (
                  <WizardButton
                    className={classes.nextbuttonStyle}
                    onClick={e => handleNext(e, currentFormElementGroup)}
                    params={{ page: currentPageNumber + 1 }}
                    text={t("next")}
                  />
                ) : (
                  <Button className={classes.nextbuttonStyle} onClick={onSave} type="button">
                    {t("save")}
                  </Button>
                )}
              </Box>
            </Box>
            {redirect && <Redirect to={onSaveGoto} />}
            {saved && (
              <CustomizedSnackbar
                message={t(message || "Your details have been successfully registered.")}
              />
            )}
          </Paper>
        </div>
      )}
    </Fragment>
  );
};

export default withRouter(withParams(FormWizard));
