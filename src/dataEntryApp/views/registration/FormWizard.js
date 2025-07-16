import { Fragment, useState } from "react";
import { styled } from "@mui/material/styles";
import { Box, Paper, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Redirect } from "react-router-dom";
import CustomizedSnackbar from "../../components/CustomizedSnackbar";
import FormWizardHeader from "dataEntryApp/views/registration/FormWizardHeader";
import FormWizardButton from "dataEntryApp/views/registration/FormWizardButton";
import { FormElementGroup as FormElementGroupComponent } from "dataEntryApp/components/FormElementGroup";
import _ from "lodash";
import Summary from "./Summary";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(0, 3, 10, 3),
  height: "auto",
  border: "1px solid #f1ebeb",
  position: "relative",
  minHeight: "600px"
}));

const StyledButtonContainer = styled(Box)({
  position: "absolute",
  bottom: 0,
  left: 0,
  backgroundColor: "#f8f4f4",
  height: 80,
  width: "100%",
  padding: "25px",
  display: "flex"
});

const StyledButtonWrapper = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(2.5)
}));

const StyledTitleContainer = styled(Box)({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between"
});

const StyledPrevButton = styled(Button)({
  color: "orange",
  width: 110,
  height: 30,
  fontSize: 12,
  borderColor: "orange",
  cursor: "pointer",
  borderRadius: 50,
  padding: "4px 25px",
  backgroundColor: "white"
});

const StyledNextButton = styled(Button)({
  backgroundColor: "orange",
  color: "white",
  height: 30,
  fontSize: 12,
  width: 110,
  cursor: "pointer",
  borderRadius: 50,
  padding: "4px 25px",
  "&:hover": {
    backgroundColor: "#e69500"
  }
});

const StyledErrorTypography = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(2.5),
  color: theme.palette.error.main
}));

const FormWizard = ({
  form,
  obsHolder,
  updateObs,
  observations,
  saved,
  onSaveGoto,
  onSave,
  message,
  subject,
  validationResults,
  additionalRows,
  registrationFlow,
  children,
  filteredFormElements,
  fetchRulesResponse,
  formElementGroup,
  onNext,
  onPrevious,
  onSummaryPage,
  wizard,
  addNewQuestionGroup,
  removeQuestionGroup,
  saveErrorMessageKey
}) => {
  const [redirect, setRedirect] = useState(false);
  const { t } = useTranslation();

  if (!form) return <div />;

  if (saved) {
    setTimeout(() => {
      setRedirect(true);
    }, 1000);
  }

  const isFirstPage = wizard.isFirstPage();
  const isRegistrationFirstPage = registrationFlow && isFirstPage;
  const pageTitleText = onSummaryPage
    ? t("summaryAndRecommendations")
    : t(isRegistrationFirstPage ? "Basic Details" : formElementGroup.name);
  const pageTitle = `${pageTitleText}`;

  return (
    <Fragment>
      {form && (
        <div>
          {subject && !wizard.isNonFormPage() ? <FormWizardHeader subject={subject} /> : ""}
          <StyledTitleContainer>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {pageTitle}
            </Typography>
          </StyledTitleContainer>
          <StyledPaper>
            {onSummaryPage ? (
              <Summary observations={observations} additionalRows={additionalRows} form={form} fetchRulesResponse={fetchRulesResponse} />
            ) : (
              <FormElementGroupComponent
                key={formElementGroup.uuid}
                obsHolder={obsHolder}
                updateObs={updateObs}
                validationResults={validationResults}
                filteredFormElements={filteredFormElements}
                renderChildren={isFirstPage}
                addNewQuestionGroup={addNewQuestionGroup}
                removeQuestionGroup={removeQuestionGroup}
              >
                {children}
              </FormElementGroupComponent>
            )}
            <StyledButtonContainer>
              <StyledButtonWrapper>
                <FormWizardButton
                  component={StyledPrevButton}
                  text={t("previous")}
                  disabled={!onSummaryPage && isFirstPage}
                  onClick={onPrevious}
                  id="previous"
                />
              </StyledButtonWrapper>
              <Box>
                <FormWizardButton
                  component={StyledNextButton}
                  onClick={onSummaryPage ? onSave : onNext}
                  text={onSummaryPage ? t("save") : t("next")}
                  id={onSummaryPage ? "save" : "next"}
                />
              </Box>
              {!_.isEmpty(saveErrorMessageKey) && <StyledErrorTypography>{t(saveErrorMessageKey)}</StyledErrorTypography>}
            </StyledButtonContainer>
            {redirect && <Redirect to={onSaveGoto} />}
            {saved && <CustomizedSnackbar message={t(message || "Your details have been successfully registered.")} />}
          </StyledPaper>
        </div>
      )}
    </Fragment>
  );
};

export default FormWizard;
