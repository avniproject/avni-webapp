import { Fragment } from "react";
import { styled } from "@mui/material/styles";
import { Grid, Button } from "@mui/material";
import SubjectTypeIcon from "../../components/SubjectTypeIcon";
import { sortBy } from "lodash";

const StyledGridContainer = styled(Grid)({
  alignItems: "center"
});

const StyledGridItem = styled(Grid)({
  alignItems: "center"
});

const StyledButton = styled(Button, {
  shouldForwardProp: prop => prop !== "isSelected"
})(({ theme, isSelected }) => ({
  margin: theme.spacing(1),
  color: theme.palette.getContrastText(
    isSelected ? "rgba(0,108,235,0.85)" : "rgb(252,252,252)"
  ),
  background: isSelected ? "rgba(0,108,235,0.85)" : "rgb(252,252,252)",
  "&:hover": {
    backgroundColor: "rgb(0,108,235)"
  }
}));

const SubjectTypeOptions = ({
  t,
  operationalModules,
  onSubjectTypeChange,
  selectedSubjectTypeUUID
}) => {
  return (
    <Fragment>
      <StyledGridContainer container direction="row" spacing={1}>
        {operationalModules.subjectTypes
          ? sortBy(operationalModules.subjectTypes, ({ name }) => t(name)).map(
              (subjectType, index) => (
                <StyledGridItem key={index}>
                  <StyledButton
                    variant="outlined"
                    onClick={() => onSubjectTypeChange(subjectType.uuid)}
                    isSelected={selectedSubjectTypeUUID === subjectType.uuid}
                  >
                    <StyledGridContainer container direction="row" spacing={1}>
                      <StyledGridItem>
                        <SubjectTypeIcon size={25} subjectType={subjectType} />
                      </StyledGridItem>
                      <StyledGridItem>{subjectType.name}</StyledGridItem>
                    </StyledGridContainer>
                  </StyledButton>
                </StyledGridItem>
              )
            )
          : ""}
      </StyledGridContainer>
    </Fragment>
  );
};

export default SubjectTypeOptions;
