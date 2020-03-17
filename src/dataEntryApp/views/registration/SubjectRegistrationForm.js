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
import BrowserStore from '../../api/browserStore';

const useStyle = makeStyles(theme => ({
  form: {
    padding: theme.spacing(0, 3, 4, 3),
    height: 600,
    border: "1px solid #f1ebeb",
    position: "relative"
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
  setSubject
}) => {
  React.useEffect(()=>{
    if(!subject){      
      (async function fetchData() {
        await onLoad(match.queryParams.type);               
        let subject = BrowserStore.fetchSubject();
        if(subject){          
          setSubject(subject);  
                  } 

      })();  
    }    
  })
  const classes = useStyle();
  const [redirect, setRedirect] = React.useState(false);

  const page = +match.queryParams.page;
  const from = match.queryParams.from;

  const firstPageNumber = form && form.firstFormElementGroup.displayOrder;
  const currentPageNumber = isNaN(page) ? firstPageNumber : page;
  const lastPageNumber = form && form.getLastFormElementElementGroup().displayOrder;

  const pageDetails = {
    nextPageNumber:
      currentPageNumber === lastPageNumber
        ? null
        : form && form.getNextFormElement(currentPageNumber).displayOrder,
    previousPageNumber:
      currentPageNumber === firstPageNumber
        ? null
        : form && form.getPrevFormElement(currentPageNumber).displayOrder,
    location,
    from
  };

  const current = form && form.formElementGroupAt(currentPageNumber);
  const pageCount = currentPageNumber + 1 + " / " + (lastPageNumber + 1);
  const { t } = useTranslation();
  const onOkHandler = data => {
    setRedirect(data);
  };

  return (
    <Fragment>
      {form && (
        <div>
          <Header subject={subject} />
          <Box display="flex" flexDirection={"row"} flexWrap="wrap" justifyContent="space-between">
            <Typography variant="subtitle1" gutterBottom>
              {" "}
              {currentPageNumber + 1}. {t(current.name)}{" "}
            </Typography>
            <Paginator
              pageDetails={pageDetails}
              onSave={onSave}
              label={{ Previous: "previous", Next: "next", Save: "save", type: "text" }}
              showCount="true"
              count={pageCount}
            />
          </Box>
          <Paper className={classes.form}>
            {currentPageNumber === lastPageNumber ? (
              <Summary subject={subject} />
            ) : (
              <Form current={current} obs={obs} updateObs={updateObs} />
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
                showCount="false"
              />
            </div>
          </Paper>
        </div>
      )}
    </Fragment>
  );
};

export default withRouter(withParams(SubjectRegistrationForm));
