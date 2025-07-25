import { styled } from "@mui/material/styles";
import {
  Grid,
  CardActionArea,
  CardContent,
  Typography,
  Card
} from "@mui/material";
import { getFormattedDateTime } from "../../../../../adminApp/components/AuditUtil";

const StyledCard = styled(Card)(({ theme }) => ({
  minHeight: theme.spacing(20),
  width: "100%"
}));

const StyledCardActionArea = styled(CardActionArea)({
  "&:hover .MuiCardActionArea-focusHighlight": {
    opacity: 0
  }
});

const StyledImagePlaceholder = styled("div")({
  width: "204px",
  height: "120px"
});

const NewsCard = ({ signedHeroImage, title, publishedDate, id }) => {
  const renderImage = () =>
    signedHeroImage ? (
      <img src={signedHeroImage} alt={title} width="204px" height="120px" />
    ) : (
      <StyledImagePlaceholder />
    );

  return (
    <StyledCard>
      <StyledCardActionArea disableRipple href={`#/app/news/${id}/details`}>
        <CardContent>
          <Grid
            container
            direction="row"
            spacing={2}
            sx={{ alignItems: "center" }}
          >
            <Grid>{renderImage()}</Grid>
            <Grid container direction="column" size={8}>
              <Grid>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  {title}
                </Typography>
              </Grid>
              <Grid>
                <Typography sx={{ opacity: 0.7, mb: 1 }} variant="body2">
                  {getFormattedDateTime(publishedDate)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </StyledCardActionArea>
    </StyledCard>
  );
};

export default NewsCard;
