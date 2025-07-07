import { useEffect } from "react";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { getNews, selectNewsList } from "../../../../reducers/NewsReducer";
import { map } from "lodash";
import { Box, Grid, Paper, Divider, Typography } from "@mui/material";
import NewsCard from "./NewsCard";

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(5),
  marginBottom: theme.spacing(5),
  marginLeft: theme.spacing(15),
  marginRight: theme.spacing(15),
  padding: theme.spacing(8),
  paddingTop: theme.spacing(3)
}));

const StyledTypography = styled(Typography)({
  opacity: 0.5
});

export const NewsList = ({ match, ...props }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getNews());
  }, []);

  const newsList = useSelector(selectNewsList);

  return (
    <StyledPaper elevation={0}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {"News broadcast"}
      </Typography>
      <StyledTypography variant="body1" sx={{ mb: 1 }}>
        {"Below is the list of all news published"}
      </StyledTypography>
      <Box sx={{ mt: 2 }} />
      <Divider />
      <Box sx={{ mt: 2 }} />
      <Grid container direction="column" spacing={3}>
        {map(newsList, news => (
          <Grid key={news.id}>
            <NewsCard {...news} />
          </Grid>
        ))}
      </Grid>
    </StyledPaper>
  );
};
