import React, { Fragment } from "react";
import { filter, find, findIndex, isEmpty, isNil, sortBy, unionBy } from "lodash";
import { withParams } from "../../../common/components/utils";
import { Redirect, withRouter } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import Summary from "./Summary";
import { Box, Button, Paper, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { StaticFormElementGroup, ValidationResults, FormElementGroup } from "avni-models";
import CustomizedSnackbar from "../../components/CustomizedSnackbar";
import { filterFormElements } from "../../services/FormElementService";
import { getFormElementsStatuses } from "../../services/RuleEvaluationService";
import FormWizardHeader from "dataEntryApp/views/registration/FormWizardHeader";
import FormWizardButton from "dataEntryApp/views/registration/FormWizardButton";
import { FormElementGroup as FormElementGroupComponent } from "dataEntryApp/components/FormElementGroup";

const useStyle = makeStyles(theme => ({
  form: {
    padding: theme.spacing(0, 3, 10, 3),
    height: "Auto",
    border: "1px solid #f1ebeb",
    position: "relative",
    minHeight: "600px"
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

const filterFormElementsWithStatus = (formElementGroup, entity) => {
  let formElementStatuses = getFormElementsStatuses(entity, formElementGroup);
  return {
    filteredFormElements: formElementGroup.filterElements(formElementStatuses),
    formElementStatuses
  };
};

const getPageNumber = index => (index === -1 ? 1 : index + 1);

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
  additionalRows,
  registrationFlow,
  children,
  filteredFormElements,
  entity,
  setFilteredFormElements,
  history,
  fetchRulesResponse,
  formElementGroup
}) => {
  if (!form) return <div />;

  if (saved) {
    setTimeout(() => {
      setRedirect(true);
    }, 2500);
  }

  const { from } = match.queryParams;

  const firstGroupWithAtLeastOneVisibleElement = find(
    sortBy(form.nonVoidedFormElementGroups(), "displayOrder"),
    formElementGroup => filterFormElements(formElementGroup, entity).length !== 0
  );

  const indexOfGroup = firstGroupWithAtLeastOneVisibleElement
    ? findIndex(
        form.getFormElementGroups(),
        feg => feg.uuid === firstGroupWithAtLeastOneVisibleElement.uuid
      )
    : registrationFlow
    ? 1
    : -1;

  const currentPageNumber = match.queryParams.page
    ? parseInt(match.queryParams.page)
    : getPageNumber(indexOfGroup);

  const [redirect, setRedirect] = React.useState(false);
  const classes = useStyle();
  const { t } = useTranslation();

  const formElementGroups =
    (isNil(form) ||
      isNil(form.firstFormElementGroup) ||
      isNil(firstGroupWithAtLeastOneVisibleElement)) &&
    !registrationFlow
      ? new Array(new StaticFormElementGroup(form))
      : form.getFormElementGroups().filter(feg => !isEmpty(feg.nonVoidedFormElements()));
  const formElementGroupsLength = formElementGroups.length;
  const isOnSummaryPage = currentPageNumber > formElementGroupsLength;

  let currentFormElementGroup;
  if (!isOnSummaryPage) {
    currentFormElementGroup = formElementGroups[currentPageNumber - 1];
  }

  const isFirstGroup = currentFormElementGroup && currentFormElementGroup.isFirst;

  const isFirstPage =
    firstGroupWithAtLeastOneVisibleElement && currentFormElementGroup
      ? currentFormElementGroup.uuid === firstGroupWithAtLeastOneVisibleElement.uuid
      : isFirstGroup;

  const handleNext = (event, feg, page, skippedGroupCount = 0) => {
    const filteredFormElement = filterFormElements(feg, entity);
    const formElementGroup = new FormElementGroup();
    const formElementGroupValidations = formElementGroup.validate(obsHolder, filteredFormElement);
    const elementsWithValidationError = filter(
      formElementGroupValidations,
      ({ success }) => !success
    );
    const allRuleValidationResults = unionBy(
      elementsWithValidationError,
      validationResults,
      "formIdentifier"
    );
    const staticValidationResultsError =
      staticValidationResults &&
      new ValidationResults(staticValidationResults).hasValidationError();
    setValidationResults(allRuleValidationResults);
    if (
      new ValidationResults(allRuleValidationResults).hasValidationError() ||
      staticValidationResultsError
    ) {
      event.preventDefault();
      return;
    }
    const nextGroup = feg.next();
    const { filteredFormElements, formElementStatuses } = !isEmpty(nextGroup)
      ? filterFormElementsWithStatus(nextGroup, entity)
      : { filteredFormElements: null };
    const nextPage = page + 1;
    if (!isEmpty(nextGroup) && isEmpty(filteredFormElements)) {
      obsHolder.removeNonApplicableObs(nextGroup.getFormElements(), filteredFormElements);
      obsHolder.updatePrimitiveObs(filteredFormElements, formElementStatuses);
      handleNext(event, nextGroup, nextPage, skippedGroupCount + 1);
    } else {
      setFilteredFormElements(filteredFormElements);
      let currentUrlParams = new URLSearchParams(history.location.search);
      currentUrlParams.set("page", (nextPage - skippedGroupCount).toString());
      history.push(history.location.pathname + "?" + currentUrlParams.toString());
    }
  };

  const getPreviousGroup = feg => (feg && feg.previous()) || [];

  const handlePrevious = (event, feg, currentPage, skippedGroupCount = 0) => {
    const previousGroup =
      currentPage > formElementGroupsLength
        ? form.getLastFormElementElementGroup()
        : getPreviousGroup(feg);
    const { filteredFormElements, formElementStatuses } = !isEmpty(previousGroup)
      ? filterFormElementsWithStatus(previousGroup, entity)
      : { filteredFormElements: null };
    const previousPage = currentPage - 1;
    if (
      (!isEmpty(previousGroup) || registrationFlow) &&
      isEmpty(filteredFormElements) &&
      previousPage > 0
    ) {
      if (!isEmpty(previousGroup)) {
        obsHolder.removeNonApplicableObs(previousGroup.getFormElements(), filteredFormElements);
        obsHolder.updatePrimitiveObs(filteredFormElements, formElementStatuses);
      }
      handlePrevious(event, previousGroup, previousPage, skippedGroupCount + 1);
    } else {
      setFilteredFormElements(filteredFormElements);
      let currentUrlParams = new URLSearchParams(history.location.search);
      if (previousPage + skippedGroupCount !== 0) {
        currentUrlParams.set("page", (previousPage + skippedGroupCount).toString());
        history.push(history.location.pathname + "?" + currentUrlParams.toString());
      } else {
        const pathName = registrationFlow ? "/app/register" : history.location.pathname;
        currentUrlParams.delete("page");
        history.push(pathName + "?" + currentUrlParams.toString());
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

  const goBackToRegistrationDefaultPage = registrationFlow && currentPageNumber === 1;

  return (
    <Fragment>
      {form && (
        <div>
          {subject ? <FormWizardHeader subject={subject} /> : ""}
          <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-between">
            <Typography variant="subtitle1" gutterBottom>
              {" "}
              {pageTitle}
            </Typography>
            <Box flexDirection={"row"} display={"flex"}>
              <FormWizardButton
                className={classes.topnav}
                to={goBackToRegistrationDefaultPage ? from : null}
                params={goBackToRegistrationDefaultPage ? {} : { page: currentPageNumber - 1 }}
                text={t("previous")}
                disabled={!registrationFlow && isFirstPage}
                onClick={e => handlePrevious(e, currentFormElementGroup, currentPageNumber)}
              />
              <label className={classes.toppagenum}>{pageCounter}</label>
              {!isOnSummaryPage ? (
                <FormWizardButton
                  className={classes.topnav}
                  onClick={e => handleNext(e, currentFormElementGroup, currentPageNumber)}
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
              <Summary
                observations={observations}
                additionalRows={additionalRows}
                form={form}
                fetchRulesResponse={fetchRulesResponse}
              />
            ) : (
              <FormElementGroupComponent
                parentChildren={children}
                key={formElementGroup.uuid}
                obsHolder={obsHolder}
                updateObs={updateObs}
                validationResults={validationResults}
                filteredFormElements={filteredFormElements}
                entity={entity}
                renderParent={isFirstPage}
              >
                {formElementGroup}
              </FormElementGroupComponent>
            )}

            <Box className={classes.buttomstyle} display="flex">
              <Box style={{ marginRight: 20 }}>
                <FormWizardButton
                  className={classes.privbuttonStyle}
                  to={goBackToRegistrationDefaultPage ? from : null}
                  params={goBackToRegistrationDefaultPage ? {} : { page: currentPageNumber - 1 }}
                  text={t("previous")}
                  disabled={!registrationFlow && isFirstPage}
                  onClick={e => handlePrevious(e, currentFormElementGroup, currentPageNumber)}
                />
              </Box>
              <Box>
                {!isOnSummaryPage ? (
                  <FormWizardButton
                    className={classes.nextbuttonStyle}
                    onClick={e => handleNext(e, currentFormElementGroup, currentPageNumber)}
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
