import { styled } from "@mui/material/styles";
import { Paper, Grid, Button, Typography } from "@mui/material";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: 20,
  marginBottom: 10,
  elevation: 2
}));

const StyledGrid = styled(Grid)({
  alignItems: "flex-start"
});

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  marginBottom: 8
}));

const SubjectVoided = ({ onUnVoid, showUnVoid }) => {
  return (
    <StyledPaper>
      <StyledGrid container direction="column">
        <StyledGrid>
          <StyledTypography variant="h4">{"THE SUBJECT HAS BEEN VOIDED"}</StyledTypography>
        </StyledGrid>
        <StyledGrid>
          {showUnVoid && (
            <Button onClick={onUnVoid} color="primary">
              {"Unvoid"}
            </Button>
          )}
        </StyledGrid>
      </StyledGrid>
    </StyledPaper>
  );
};

export default SubjectVoided;
