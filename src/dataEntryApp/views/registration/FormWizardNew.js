import React, { Fragment } from "react";
import { isEmpty } from "lodash";
import { withParams } from "../../../common/components/utils";
import Paginator from "../../components/Paginator";
import { withRouter, Redirect } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import { LineBreak } from "../../../common/components/utils";
import moment from "moment/moment";
import Form from "../../components/Form";
import Summary from "./Summary";
import { FormElementGroup } from "../../components/FormElementGroup";
import { Box, Typography, Paper } from "@material-ui/core";
import CustomizedDialog from "../../components/Dialog";
import { useTranslation } from "react-i18next";
import BrowserStore from "../../api/browserStore";

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
    backgroundColor: "#F8F9F9",
    height: 80,
    width: "100%",
    padding: 25
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
  const dateOfBirth = moment().diff(subject.dateOfBirth, "years") + "yrs" || "-";
  return (
    <div className={classes.details}>
      {subject.firstName ? (
        <>
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
            {/* <Typography className={classes.detailsstyle} variant="caption" gutterBottom>
          {children}
        </Typography> */}
          </Typography>
          <LineBreak num={2} />
        </>
      ) : (
        "No details"
      )}
    </div>
  );
};

const FormWizardNew = ({
  form,
  obsHolder,
  updateObs,
  observations,
  location,
  title,
  match,
  saved,
  onSaveGoto,
  onSave,
  subject,
  onLoad,
  setSubject,
  children,
  staticPage,
  staticPageTitle
}) => {
  const classes = useStyle();

  const { t } = useTranslation();

  const [redirect, setRedirect] = React.useState(false);

  const from = match.queryParams.from;
  const currentPageNumber = match.queryParams.page ? parseInt(match.queryParams.page) : 1;
  const formElementGroups = form
    .getFormElementGroups()
    .filter(feg => !isEmpty(feg.nonVoidedFormElements()));

  const totalNumberOfPages = staticPage ? formElementGroups.length + 1 : formElementGroups.length;
  const isOnSummaryPage = currentPageNumber > totalNumberOfPages;
  const isOnStaticPage = currentPageNumber === 1 && staticPage;
  const currentFormElementGroup =
    isOnSummaryPage || isOnStaticPage ? null : formElementGroups[currentPageNumber - 1];

  const pageDetails = {
    nextPageNumber: currentPageNumber + 1,
    previousPageNumber: currentPageNumber - 1,
    currentPageNumber: currentPageNumber,
    totalNumberOfPages: totalNumberOfPages,
    isOnSummaryPage: isOnSummaryPage,
    from: from
  };

  const onOkHandler = data => {
    BrowserStore.clear("subject");
    setRedirect(data);
  };

  const pageTitle = isOnSummaryPage
    ? t("summaryAndRecommendations")
    : `${currentPageNumber}. ${t(
        isOnStaticPage ? staticPageTitle : currentFormElementGroup.name
      )} `;

  return (
    <Fragment>
      {form && (
        <div>
          {subject ? <Header subject={subject} /> : ""}
          <Box display="flex" flexDirection={"row"} flexWrap="wrap" justifyContent="space-between">
            <Typography variant="subtitle1" gutterBottom>
              {" "}
              {pageTitle}
            </Typography>
            <Paginator
              pageDetails={pageDetails}
              onSave={onSave}
              label={{ Previous: "previous", Next: "next", Save: "save", type: "text" }}
              showCount={true}
              count={totalNumberOfPages}
            />
          </Box>
          <Paper className={classes.form}>
            {isOnStaticPage ? (
              staticPage
            ) : isOnSummaryPage ? (
              <Summary observations={observations} />
            ) : (
              <FormElementGroup
                parentChildren={children}
                key={currentFormElementGroup.uuid}
                obsHolder={obsHolder}
                updateObs={updateObs}
              >
                {currentFormElementGroup}
              </FormElementGroup>
            )}

            {saved && (
              <CustomizedDialog
                showSuccessIcon="true"
                message={t("Your details have been successfully registered.")}
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
              />
            </div>
          </Paper>
        </div>
      )}
    </Fragment>
  );
};

export default withRouter(withParams(FormWizardNew));
