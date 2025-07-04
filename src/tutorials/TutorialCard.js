import { styled } from "@mui/material/styles";
import { Card, CardContent, Typography, CardActionArea, Grid } from "@mui/material";

const StyledCard = styled(Card)({
  maxWidth: 500,
  backgroundColor: "#FFF"
});

const StyledCardActionArea = styled(CardActionArea)({
  color: "inherit",
  textDecoration: "inherit"
});

const StyledTitleTypography = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1)
}));

const StyledContentTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary
}));

const TutorialCard = ({ href, title, content, footer, iconComponent }) => {
  return (
    <StyledCard>
      <StyledCardActionArea href={href} target="_blank">
        <CardContent>
          <Grid container wrap="wrap">
            <Grid container direction="row" spacing={1}>
              <Grid>{iconComponent}</Grid>
              <Grid size={10}>
                <StyledTitleTypography variant="h5" component="h2">
                  {title}
                </StyledTitleTypography>
                <StyledContentTypography variant="body2" component="p">
                  {content}
                  {footer}
                </StyledContentTypography>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </StyledCardActionArea>
    </StyledCard>
  );
};

export default TutorialCard;
