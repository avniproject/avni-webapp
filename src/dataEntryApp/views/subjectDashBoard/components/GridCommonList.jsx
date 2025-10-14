import { styled } from "@mui/material/styles";
import {
  Typography,
  Grid,
  Card,
  CardActions,
  CardContent
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { InternalLink } from "../../../../common/components/utils";
import RemoveRelative from "../components/RemoveRelative";
import SubjectProfilePicture from "../../../components/SubjectProfilePicture";
import { Individual } from "avni-models";

const StyledGridContainer = styled(Grid)(({ theme }) => ({
  borderBottom: "1px solid rgba(0,0,0,0.12)",
  paddingBottom: theme.spacing(1.25) // 10px
}));

const StyledGridItem = styled(Grid)({
  borderRight: "1px solid rgba(0,0,0,0.12)",
  "&:nth-of-type(4n), &:last-child": {
    borderRight: "0px solid rgba(0,0,0,0.12)"
  }
});

const StyledCard = styled(Card)({
  boxShadow: "0px 0px 0px 0px",
  borderRadius: 0
});

const StyledTypographyTitle = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1)
}));

const StyledTypographyLink = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main
}));

const StyledCardActions = styled(CardActions)({
  padding: "8px 8px 8px 0px"
});

const GridCommonList = ({ profileUUID, profileName, gridListDetails }) => {
  const { t } = useTranslation();

  return (
    <StyledGridContainer container size={12}>
      {gridListDetails &&
        gridListDetails
          .filter(
            relative =>
              relative !== undefined &&
              !relative.voided &&
              relative.individualB &&
              relative.individualB.subjectType &&
              relative.individualB.subjectType.type &&
              relative.individualB.subjectType.name
          )
          .map((relative, index) => (
            <StyledGridItem key={index} size={3}>
              <StyledCard>
                <CardContent>
                  <Grid container direction="row" spacing={1}>
                    <Grid>
                      <SubjectProfilePicture
                        allowEnlargementOnClick
                        firstName={relative.individualB.name}
                        profilePicture={relative.individualB.profilePicture}
                        subjectType={relative.individualB.subjectType}
                        subjectTypeName={relative.individualB.subjectType.name}
                        size={25}
                        sx={{ margin: 0 }}
                      />
                    </Grid>
                    <Grid>
                      <StyledTypographyLink component="div">
                        <InternalLink
                          to={`/app/subject?uuid=${relative.individualB.uuid}`}
                        >
                          {Individual.getFullName(relative.individualB)}
                        </InternalLink>
                      </StyledTypographyLink>
                      <StyledTypographyTitle component="div">
                        {t(relative.relationship.individualBIsToARelation.name)}
                      </StyledTypographyTitle>
                      <StyledTypographyTitle component="div">
                        {new Date().getFullYear() -
                          new Date(
                            relative.individualB.dateOfBirth
                          ).getFullYear()}{" "}
                        {t("years")}
                      </StyledTypographyTitle>
                    </Grid>
                  </Grid>
                </CardContent>
                <StyledCardActions>
                  <RemoveRelative
                    relationAuuid={profileUUID}
                    relationAname={profileName}
                    relationBname={Individual.getFullName(relative.individualB)}
                    relationBId={relative.id}
                    relationuuid={relative.uuid}
                    relationBuuid={relative.individualB.uuid}
                    relationBTypeuuid={relative.relationship.uuid}
                  />
                </StyledCardActions>
              </StyledCard>
            </StyledGridItem>
          ))}
    </StyledGridContainer>
  );
};

export default GridCommonList;
