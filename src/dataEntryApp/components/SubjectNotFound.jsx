import { Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1,
  minHeight: "60vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
}));

export const useSubjectNotFound = (subjectUuid) =>
  useSelector(
    (state) =>
      !!subjectUuid &&
      state.dataEntry.subjectProfile.notFoundSubjectUuid === subjectUuid,
  );

const SubjectNotFound = () => {
  const { t } = useTranslation();
  return (
    <StyledPaper elevation={2}>
      <Typography variant="h6" data-testid="subject-not-found">
        {t("subjectNotFound")}
      </Typography>
    </StyledPaper>
  );
};

export default SubjectNotFound;
