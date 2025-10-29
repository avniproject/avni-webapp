import { styled } from "@mui/material/styles";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import { InternalLink } from "../../common/components/utils";
import { useTranslation } from "react-i18next";
import SubjectProfilePicture from "./SubjectProfilePicture";

const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: theme.shadows[2],
  borderRadius: "2",
  width: "100%",
  whiteSpace: "nowrap",
  overflowWrap: "normal",
  minHeight: 150,
  justifyContent: "center",
  margin: 20,
  textDecoration: "none",
  alignItems: "center",
  background: theme.palette.background.paper,
}));

const StyledGridContainer = styled(Grid)({
  justifyContent: "center",
  alignItems: "center",
  flexWrap: "nowrap",
});

const StyledTypography = styled(Typography)({
  textAlign: "center",
  marginBottom: 8,
});

const StyledSubjectProfilePicture = styled(SubjectProfilePicture)({
  margin: "0px",
});

const SubjectCardView = ({
  uuid,
  name,
  gender,
  age,
  location,
  profilePicture,
  subjectTypeName,
  ...props
}) => {
  const { t } = useTranslation();

  return (
    <StyledCard key={uuid}>
      <CardContent>
        <StyledGridContainer container direction="row" spacing={1}>
          <Grid>
            <StyledSubjectProfilePicture
              allowEnlargementOnClick={true}
              firstName={name}
              profilePicture={profilePicture}
              subjectType={null}
              subjectTypeName={subjectTypeName}
              size={25}
            />
          </Grid>
          <Grid>
            <InternalLink to={`/app/subject?uuid=${uuid}`}>{name}</InternalLink>
          </Grid>
        </StyledGridContainer>
        {[gender, age, location].map((element, index) => {
          return (
            element && (
              <StyledTypography component="div" key={index}>
                {t(element)}
              </StyledTypography>
            )
          );
        })}
      </CardContent>
      {props.children && <CardContent>{props.children}</CardContent>}
    </StyledCard>
  );
};

export default SubjectCardView;
