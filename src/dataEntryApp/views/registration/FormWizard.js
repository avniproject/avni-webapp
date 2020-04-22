import React, { Fragment } from "react";
import { isNaN } from "lodash";
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
    </div>
  );
};

const FormWizard = ({
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
  validationResults,
  onLoad,
  setSubject,
  children
}) => {
  const classes = useStyle();

  const { t } = useTranslation();

  const [redirect, setRedirect] = React.useState(false);
  const from = match.queryParams.from;

  const firstPageNumber =
    form && form.firstFormElementGroup && form.firstFormElementGroup.displayOrder;
  const lastPageNumber = form && form.getLastFormElementElementGroup().displayOrder;
  const page =
    parseInt(match.queryParams.page) === parseInt(lastPageNumber)
      ? parseInt(match.queryParams.page)
      : parseInt(+match.queryParams.page);

  const currentPageNumber = isNaN(page) ? firstPageNumber : page;
  const showSummaryPage = page >= lastPageNumber + 1;

  const pageDetails = {
    nextPageNumber: showSummaryPage
      ? null
      : form && form.getNextFormElement(currentPageNumber) !== undefined
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

  const current = showSummaryPage
    ? { name: `${t("Summary and Recommendations")}` }
    : form && form.formElementGroupAt(currentPageNumber);
  const pageCount = currentPageNumber + " / " + (lastPageNumber + 1);
  const onOkHandler = data => {
    BrowserStore.clear("subject");
    setRedirect(data);
  };

  return (
    <Fragment>
      {form && (
        <div>
          {subject ? <Header subject={subject} /> : ""}
          <Box display="flex" flexDirection={"row"} flexWrap="wrap" justifyContent="space-between">
            <Typography variant="subtitle1" gutterBottom>
              {" "}
              {currentPageNumber}. {t(current.name)}{" "}
            </Typography>
            <Paginator
              pageDetails={pageDetails}
              onSave={onSave}
              label={{ Previous: "previous", Next: "next", Save: "save", type: "text" }}
              showCount={true}
              count={pageCount}
              feg={current}
              obsHolder={obsHolder}
            />
          </Box>
          <Paper className={classes.form}>
            {currentPageNumber >= lastPageNumber + 1 ? (
              <Summary observations={observations} />
            ) : (
              <Form
                current={current}
                obsHolder={obsHolder}
                updateObs={updateObs}
                validationResults={validationResults}
                children={children}
              />
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
                feg={current}
                obsHolder={obsHolder}
              />
            </div>
          </Paper>
        </div>
      )}
    </Fragment>
  );
};

export default withRouter(withParams(FormWizard));
